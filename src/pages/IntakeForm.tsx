import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SignaturePad } from "../components/SignaturePad";
import { submitIntakeForm, type IntakeFormData, type TherapistChoice } from "../lib/intakeForms";
import { CAL_USERNAME, THERAPIES, calSlugFor, type LocationKey } from "../data/content";
import { initCal, openBookingModal } from "../lib/cal";
import { formatUSPhone, isValidUSPhone, toE164USPhone } from "../lib/phone";
import { US_STATES } from "../lib/usStates";
import { searchAddress, type AddressSuggestion } from "../lib/addressLookup";
import { generateConsentPdf, getLogoDataUrl } from "../lib/patientConsentPdf";
import { usePageMeta } from "../hooks/usePageMeta";
import styles from "./IntakeForm.module.css";

type FormState = Omit<IntakeFormData, "signatureDataUrl" | "authorizedTechniques"> & {
  authorizedTechniques: string[];
};

const BASE_TECHNIQUE_OPTIONS = [
  "Imposición de manos en los puntos energéticos principales",
  "Limpieza energética con sage, palo santo, hierbas o flores",
  "Biomagnetismo (colocación de imanes en chakras o puntos energéticos)",
  "Piedras de cuarzo según el punto energético a tratar",
  "Aromaterapia: aceites, aromas e inciensos",
  "Exploración terapéutica de vida pasada",
  "Canalización espiritual (guías o ancestros)",
];

const SONOTERAPIA_TECHNIQUE = "Sonoterapia con cuencos, gongs u otros instrumentos vibracionales";

const PRECAUTION_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: "hasPacemaker", label: "Marcapasos o dispositivo médico electrónico implantado" },
  { key: "hasMetalImplants", label: "Implantes metálicos" },
  { key: "isPregnant", label: "Embarazo" },
  { key: "hasHeartCondition", label: "Condición cardíaca" },
  { key: "hasBloodPressureIssue", label: "Presión arterial alta o baja" },
  { key: "hasEpilepsy", label: "Epilepsia o convulsiones" },
  { key: "hasCancer", label: "Cáncer actual o en tratamiento" },
  { key: "hasDiabetes", label: "Diabetes" },
  { key: "hasPsychiatricCondition", label: "Trastorno psiquiátrico o psicológico actual" },
  { key: "hasChronicPain", label: "Dolor crónico" },
  { key: "hasRespiratoryIssue", label: "Problemas respiratorios / asma" },
];

const INITIAL_STATE: FormState = {
  fullName: "",
  phone: "",
  email: undefined,
  birthDate: undefined,
  address: undefined,
  city: undefined,
  state: undefined,
  emergencyContactName: undefined,
  emergencyContactPhone: undefined,
  hadPreviousTherapy: false,
  previousTherapyDetails: undefined,
  currentConditions: undefined,
  currentMedications: undefined,
  surgeriesOrInjuries: undefined,
  hasEssentialOilAllergy: false,
  allergyEssentialOils: undefined,
  hasHerbsPlantsAllergy: false,
  allergyHerbsPlants: undefined,
  hasSageIncenseAllergy: false,
  allergySageIncenseSmoke: undefined,
  hasFragranceAllergy: false,
  allergyFragrances: undefined,
  allergyOther: undefined,
  hasPacemaker: false,
  hasMetalImplants: false,
  isPregnant: false,
  pregnancyWeeks: undefined,
  hasHeartCondition: false,
  hasBloodPressureIssue: false,
  hasEpilepsy: false,
  hasCancer: false,
  hasDiabetes: false,
  hasPsychiatricCondition: false,
  hasChronicPain: false,
  hasRespiratoryIssue: false,
  otherCondition: undefined,
  authorizedTechniques: [],
  otherTechnique: undefined,
  therapist: "ambos",
  consentAccepted: false,
};

function YesNoToggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className={styles.toggleRow}>
      <span className={styles.toggleLabel}>{label}</span>
      <div className={styles.toggleButtons}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${value ? styles.toggleBtnActive : ""}`}
          onClick={() => onChange(true)}
        >
          Sí
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${!value ? styles.toggleBtnActive : ""}`}
          onClick={() => onChange(false)}
        >
          No
        </button>
      </div>
    </div>
  );
}


export default function IntakeForm() {
  usePageMeta(
    "Ficha del Paciente",
    "Completa tu ficha de paciente y consentimiento informado antes de tu sesión en RenaSER."
  );

  const [searchParams] = useSearchParams();
  const therapyId = searchParams.get("therapyId");
  const location = searchParams.get("location") as LocationKey | null;
  const therapy = therapyId ? THERAPIES.find((t) => t.id === therapyId) : undefined;
  const locationName = location === "miami" ? "Miami" : location === "las-vegas" ? "Las Vegas" : null;
  // Si no sabemos qué terapia reservaron (ej. link compartido directo), se
  // muestra la lista completa; si sabemos que no es sonoterapia, se omite esa
  // técnica para no confundir con algo que no aplica a su sesión.
  const techniqueOptions =
    therapy && therapy.family !== "sonoterapia"
      ? BASE_TECHNIQUE_OPTIONS
      : [...BASE_TECHNIQUE_OPTIONS, SONOTERAPIA_TECHNIQUE];

  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_STATE,
    therapist: therapy?.defaultTherapist ?? INITIAL_STATE.therapist,
  }));
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emergencyPhoneError, setEmergencyPhoneError] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChooseTime() {
    if (!therapy || !location) return;
    initCal();

    const prefill: Record<string, string> = { name: form.fullName, email: form.email ?? "" };
    if (isValidUSPhone(form.phone)) {
      prefill.attendeePhoneNumber = toE164USPhone(form.phone);
    }

    openBookingModal(`${CAL_USERNAME}/${calSlugFor(therapy.id, location)}`, prefill);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleTechnique(item: string) {
    setForm((f) => ({
      ...f,
      authorizedTechniques: f.authorizedTechniques.includes(item)
        ? f.authorizedTechniques.filter((t) => t !== item)
        : [...f.authorizedTechniques, item],
    }));
  }

  function toggleAllTechniques(options: string[]) {
    setForm((f) => ({
      ...f,
      authorizedTechniques: options.every((item) => f.authorizedTechniques.includes(item)) ? [] : options,
    }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleAddressChange(value: string) {
    setField("address", value || undefined);

    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    if (value.trim().length < 5) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }
    addressDebounceRef.current = setTimeout(async () => {
      const results = await searchAddress(value).catch(() => []);
      setAddressSuggestions(results);
      setShowAddressSuggestions(results.length > 0);
    }, 400);
  }

  function selectAddressSuggestion(s: AddressSuggestion) {
    const stateCode = US_STATES.find((st) => st.enName.toLowerCase() === s.stateEnName.toLowerCase())?.code;
    setForm((f) => ({
      ...f,
      address: s.streetAddress || f.address,
      city: s.city || f.city,
      state: stateCode ?? f.state,
    }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!form.fullName.trim() || !form.phone.trim()) {
      setErrorMsg("Por favor completa tu nombre y teléfono.");
      return;
    }
    if (!isValidUSPhone(form.phone)) {
      setErrorMsg("Ingresa un número de teléfono de EEUU válido (10 dígitos).");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMsg("Ingresa un correo electrónico válido.");
      return;
    }
    if (form.emergencyContactPhone && !isValidUSPhone(form.emergencyContactPhone)) {
      setErrorMsg("El teléfono de emergencia no es un número de EEUU válido.");
      return;
    }
    if (!form.consentAccepted) {
      setErrorMsg("Debes aceptar el consentimiento informado para continuar.");
      return;
    }
    if (!signature) {
      setErrorMsg("Por favor firma la ficha antes de enviarla.");
      return;
    }

    setStatus("sending");
    try {
      const submissionData = {
        ...form,
        therapyName: therapy?.name,
        therapyLocation: locationName ?? undefined,
      };

      await submitIntakeForm({
        ...submissionData,
        signatureDataUrl: signature,
        photoFile: photoFile ?? undefined,
      });

      const logoDataUrl = await getLogoDataUrl();
      const pdf = generateConsentPdf(submissionData, signature, photoPreview, logoDataUrl);
      pdf.save(`RenaSER-Ficha-${form.fullName.replace(/\s+/g, "_")}.pdf`);

      setStatus("sent");
    } catch (err) {
      console.error("Error al enviar la ficha:", err);
      setStatus("error");
      setErrorMsg("Algo salió mal al enviar tu ficha. Por favor intenta de nuevo.");
    }
  }

  if (status === "sent") {
    return (
      <section className={styles.section}>
        <div className="container">
          <div className={styles.thanks}>
            <h1>¡Gracias, {form.fullName.split(" ")[0]}!</h1>
            <p>Tu ficha y consentimiento se guardaron correctamente.</p>
            <p className={styles.thanksNote}>
              Se descargó automáticamente una copia en PDF a tu dispositivo. Si no la ves, revisa tu carpeta de
              descargas.
            </p>
            {therapy && location ? (
              <button type="button" className={styles.submitButton} onClick={handleChooseTime}>
                Elegir fecha y hora de mi cita →
              </button>
            ) : (
              <p>Nos vemos pronto.</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.header}>
            <h1 className={styles.title}>Ficha del Paciente</h1>
            {therapy && locationName ? (
              <p className={styles.subtitle}>
                Para reservar tu sesión de <strong>{therapy.name}</strong> en {locationName}, primero completa este
                formulario. Al terminar, podrás elegir la fecha y hora de tu cita.
              </p>
            ) : (
              <p className={styles.subtitle}>
                Completa tus datos antes de tu sesión. Solo toma unos minutos y nos ayuda a acompañarte mejor.
              </p>
            )}
            <p className={styles.privacyNote}>
              🔒 Toda esta información es privada y confidencial — no se comparte con nadie.
            </p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Foto (opcional)</h2>
            <div className={styles.photoRow}>
              {photoPreview ? (
                <img src={photoPreview} alt="Vista previa" className={styles.photoPreview} />
              ) : (
                <div className={styles.photoPlaceholder}>📷</div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoChange}
                  className={styles.photoInput}
                  id="photo-input"
                />
                <label htmlFor="photo-input" className={styles.photoButton}>
                  {photoPreview ? "Cambiar foto" : "Subir o tomar foto"}
                </label>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Información personal</h2>
            <div className={styles.grid2}>
              <div>
                <label className={styles.label}>Nombre completo *</label>
                <input
                  className={styles.input}
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={styles.label}>Teléfono *</label>
                <input
                  className={styles.input}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="(702) 468-9914"
                  value={form.phone}
                  onChange={(e) => {
                    setField("phone", formatUSPhone(e.target.value));
                    if (phoneError) setPhoneError("");
                  }}
                  onBlur={() => {
                    if (form.phone.trim() && !isValidUSPhone(form.phone)) {
                      setPhoneError("Ingresa un número de teléfono de EEUU válido (10 dígitos).");
                    }
                  }}
                  required
                />
                {phoneError && <p className={styles.fieldError}>{phoneError}</p>}
              </div>
              <div>
                <label className={styles.label}>Correo electrónico</label>
                <input
                  className={styles.input}
                  type="email"
                  autoComplete="email"
                  value={form.email ?? ""}
                  onChange={(e) => {
                    setField("email", e.target.value || undefined);
                    if (emailError) setEmailError("");
                  }}
                  onBlur={() => {
                    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                      setEmailError("Ingresa un correo electrónico válido.");
                    }
                  }}
                />
                {emailError && <p className={styles.fieldError}>{emailError}</p>}
              </div>
              <div>
                <label className={styles.label}>Fecha de nacimiento</label>
                <input
                  className={styles.input}
                  type="date"
                  autoComplete="bday"
                  value={form.birthDate ?? ""}
                  onChange={(e) => setField("birthDate", e.target.value || undefined)}
                />
              </div>
              <div>
                <label className={styles.label}>Dirección</label>
                <div className={styles.addressWrap}>
                  <input
                    className={styles.input}
                    autoComplete="off"
                    value={form.address ?? ""}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => setShowAddressSuggestions(addressSuggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 150)}
                    placeholder="Empieza a escribir tu dirección…"
                  />
                  {showAddressSuggestions && (
                    <ul className={styles.addressSuggestions}>
                      {addressSuggestions.map((s, i) => (
                        <li key={i}>
                          <button type="button" onMouseDown={() => selectAddressSuggestion(s)}>
                            {s.displayName}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div>
                <label className={styles.label}>Ciudad</label>
                <input
                  className={styles.input}
                  autoComplete="address-level2"
                  value={form.city ?? ""}
                  onChange={(e) => setField("city", e.target.value || undefined)}
                />
              </div>
              <div>
                <label className={styles.label}>Estado</label>
                <select
                  className={styles.input}
                  autoComplete="address-level1"
                  value={form.state ?? ""}
                  onChange={(e) => setField("state", e.target.value || undefined)}
                >
                  <option value="">Selecciona un estado</option>
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.label}>Contacto de emergencia</label>
                <input
                  className={styles.input}
                  value={form.emergencyContactName ?? ""}
                  onChange={(e) => setField("emergencyContactName", e.target.value || undefined)}
                />
              </div>
              <div>
                <label className={styles.label}>Teléfono de emergencia</label>
                <input
                  className={styles.input}
                  type="tel"
                  inputMode="tel"
                  placeholder="(702) 468-9914"
                  value={form.emergencyContactPhone ?? ""}
                  onChange={(e) => {
                    setField("emergencyContactPhone", formatUSPhone(e.target.value) || undefined);
                    if (emergencyPhoneError) setEmergencyPhoneError("");
                  }}
                  onBlur={() => {
                    if (form.emergencyContactPhone && !isValidUSPhone(form.emergencyContactPhone)) {
                      setEmergencyPhoneError("Ingresa un número de teléfono de EEUU válido (10 dígitos).");
                    }
                  }}
                />
                {emergencyPhoneError && <p className={styles.fieldError}>{emergencyPhoneError}</p>}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Experiencia previa</h2>
            <YesNoToggle
              label="¿Has recibido antes terapias energéticas o sonoterapia?"
              value={form.hadPreviousTherapy}
              onChange={(v) => setField("hadPreviousTherapy", v)}
            />
            {form.hadPreviousTherapy && (
              <textarea
                className={styles.textarea}
                rows={2}
                placeholder="¿Cuáles y cuándo? ¿Cómo fue tu experiencia?"
                value={form.previousTherapyDetails ?? ""}
                onChange={(e) => setField("previousTherapyDetails", e.target.value || undefined)}
              />
            )}
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Salud general</h2>
            <label className={styles.label}>Condiciones médicas actuales</label>
            <textarea
              className={styles.textarea}
              rows={2}
              value={form.currentConditions ?? ""}
              onChange={(e) => setField("currentConditions", e.target.value || undefined)}
            />
            <label className={styles.label}>Medicamentos y suplementos actuales</label>
            <textarea
              className={styles.textarea}
              rows={2}
              value={form.currentMedications ?? ""}
              onChange={(e) => setField("currentMedications", e.target.value || undefined)}
            />
            <label className={styles.label}>Cirugías, accidentes o lesiones relevantes</label>
            <textarea
              className={styles.textarea}
              rows={2}
              value={form.surgeriesOrInjuries ?? ""}
              onChange={(e) => setField("surgeriesOrInjuries", e.target.value || undefined)}
            />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Alergias y sensibilidades — muy importante</h2>
            <YesNoToggle
              label="¿Alergia a aceites esenciales?"
              value={form.hasEssentialOilAllergy}
              onChange={(v) => setField("hasEssentialOilAllergy", v)}
            />
            {form.hasEssentialOilAllergy && (
              <input
                className={styles.input}
                placeholder="¿Cuál?"
                value={form.allergyEssentialOils ?? ""}
                onChange={(e) => setField("allergyEssentialOils", e.target.value || undefined)}
              />
            )}

            <YesNoToggle
              label="¿Alergia a hierbas, plantas o flores?"
              value={form.hasHerbsPlantsAllergy}
              onChange={(v) => setField("hasHerbsPlantsAllergy", v)}
            />
            {form.hasHerbsPlantsAllergy && (
              <input
                className={styles.input}
                placeholder="¿Cuál?"
                value={form.allergyHerbsPlants ?? ""}
                onChange={(e) => setField("allergyHerbsPlants", e.target.value || undefined)}
              />
            )}

            <YesNoToggle
              label="¿Alergia a sage, palo santo u otros humos?"
              value={form.hasSageIncenseAllergy}
              onChange={(v) => setField("hasSageIncenseAllergy", v)}
            />
            {form.hasSageIncenseAllergy && (
              <input
                className={styles.input}
                placeholder="¿Cuál?"
                value={form.allergySageIncenseSmoke ?? ""}
                onChange={(e) => setField("allergySageIncenseSmoke", e.target.value || undefined)}
              />
            )}

            <YesNoToggle
              label="¿Alergia a fragancias u olores?"
              value={form.hasFragranceAllergy}
              onChange={(v) => setField("hasFragranceAllergy", v)}
            />
            {form.hasFragranceAllergy && (
              <input
                className={styles.input}
                placeholder="¿Cuál?"
                value={form.allergyFragrances ?? ""}
                onChange={(e) => setField("allergyFragrances", e.target.value || undefined)}
              />
            )}

            <label className={styles.label} style={{ marginTop: 12 }}>
              Otros / reacciones alérgicas previas
            </label>
            <textarea
              className={styles.textarea}
              rows={2}
              value={form.allergyOther ?? ""}
              onChange={(e) => setField("allergyOther", e.target.value || undefined)}
            />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Precauciones y antecedentes</h2>
            {PRECAUTION_FIELDS.map(({ key, label }) => (
              <YesNoToggle
                key={key}
                label={label}
                value={Boolean(form[key])}
                onChange={(v) => setField(key, v as FormState[typeof key])}
              />
            ))}
            {form.isPregnant && (
              <div>
                <label className={styles.label}>Semanas de embarazo</label>
                <input
                  className={styles.input}
                  value={form.pregnancyWeeks ?? ""}
                  onChange={(e) => setField("pregnancyWeeks", e.target.value || undefined)}
                />
              </div>
            )}
            <label className={styles.label}>Otra condición relevante</label>
            <textarea
              className={styles.textarea}
              rows={2}
              value={form.otherCondition ?? ""}
              onChange={(e) => setField("otherCondition", e.target.value || undefined)}
            />
            <p className={styles.helpNote}>
              ℹ️ El biomagnetismo con imanes no se realiza en personas con marcapasos u otro dispositivo médico
              electrónico implantado.
            </p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Técnicas que autorizas</h2>
            <label className={styles.checkItem} style={{ marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={techniqueOptions.every((item) => form.authorizedTechniques.includes(item))}
                onChange={() => toggleAllTechniques(techniqueOptions)}
              />
              <span>
                <strong>Seleccionar todas</strong>
              </span>
            </label>
            <div className={styles.checkList}>
              {techniqueOptions.map((item) => (
                <label key={item} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={form.authorizedTechniques.includes(item)}
                    onChange={() => toggleTechnique(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <label className={styles.label}>Otra técnica</label>
            <input
              className={styles.input}
              value={form.otherTechnique ?? ""}
              onChange={(e) => setField("otherTechnique", e.target.value || undefined)}
            />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Terapeuta a cargo de esta sesión</h2>
            <div className={styles.radioRow}>
              {(["martha", "carlos", "ambos"] as TherapistChoice[]).map((opt) => (
                <label key={opt} className={styles.radioItem}>
                  <input
                    type="radio"
                    name="therapist"
                    checked={form.therapist === opt}
                    onChange={() => setField("therapist", opt)}
                  />
                  <span>
                    {opt === "martha" ? "Martha González" : opt === "carlos" ? "Carlos Laurenti" : "Ambos / en pareja"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Consentimiento informado</h2>
            <p className={styles.consentText}>
              Declaro que la información proporcionada en esta ficha es verdadera y completa. He informado mis
              condiciones de salud, medicamentos, alergias y sensibilidades relevantes. Entiendo que estas terapias
              son complementarias y no sustituyen la evaluación, diagnóstico o tratamiento de un médico, psicólogo,
              psiquiatra u otro profesional de salud licenciado. Autorizo únicamente las técnicas seleccionadas y
              comprendo que la sesión puede ser realizada por Martha González, Carlos Laurenti o por ambos,
              según lo acordado conmigo. Entiendo que puedo pedir que una técnica sea modificada o detenida en
              cualquier momento.
            </p>
            <label className={styles.checkItem}>
              <input
                type="checkbox"
                checked={form.consentAccepted}
                onChange={(e) => setField("consentAccepted", e.target.checked)}
              />
              <span>He leído y acepto el consentimiento informado. *</span>
            </label>

            <h2 className={styles.cardTitle} style={{ marginTop: 28 }}>
              Firma *
            </h2>
            <SignaturePad onChange={setSignature} />
          </div>

          {errorMsg && <p className={styles.errorNote}>{errorMsg}</p>}

          <button type="submit" className={styles.submitButton} disabled={status === "sending"}>
            {status === "sending"
              ? "Enviando…"
              : therapy && location
                ? "Enviar ficha y elegir horario →"
                : "Firmar y enviar ficha"}
          </button>
        </form>
      </div>
    </section>
  );
}
