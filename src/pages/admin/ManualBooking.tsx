import { useEffect, useMemo, useRef, useState } from "react";
import { CAL_USERNAME, LOCATIONS, THERAPIES, calSlugForAdmin, type LocationKey } from "../../data/content";
import { openBookingModal } from "../../lib/cal";
import { formatUSPhone, isValidUSPhone, toE164USPhone } from "../../lib/phone";
import { createPatient, listPatients, type Patient } from "../../lib/patients";
import styles from "./ManualBooking.module.css";

type Mode = "registered" | "new";

export default function ManualBooking() {
  const [mode, setMode] = useState<Mode>("registered");

  const PATIENT_RESULTS_LIMIT = 5;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [showAllPatientResults, setShowAllPatientResults] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [location, setLocation] = useState<LocationKey>("las-vegas");
  const therapiesForLocation = useMemo(
    () => THERAPIES.filter((t) => t.pricing[location]),
    [location]
  );
  const [therapyId, setTherapyId] = useState(therapiesForLocation[0]?.id ?? "");
  const [notes, setNotes] = useState("");

  const [createPatientRecord, setCreatePatientRecord] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const changeLocation = (next: LocationKey) => {
    setLocation(next);
    const stillAvailable = THERAPIES.filter((t) => t.pricing[next]);
    setTherapyId(stillAvailable[0]?.id ?? "");
  };

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    listPatients().then(setPatients);
  }, []);

  const matchingPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patients, patientSearch]);

  const visiblePatientCount = showAllPatientResults ? matchingPatients.length : PATIENT_RESULTS_LIMIT;
  const filteredPatients = matchingPatients.slice(0, visiblePatientCount);
  const hiddenPatientCount = matchingPatients.length - filteredPatients.length;

  const switchMode = (next: Mode) => {
    setMode(next);
    setSelectedPatient(null);
    setPatientSearch("");
    setName("");
    setPhone("");
    setPhoneError("");
    setCreatePatientRecord(true);
    setPhotoFile(null);
    setPhotoPreview(null);
    setBookingError("");
    setPatientDropdownOpen(false);
    setShowAllPatientResults(false);
  };

  const handlePhoto = (file: File | null) => {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearch("");
    setName(patient.name);
    setPhone(patient.phone ?? "");
    setPatientDropdownOpen(false);
    setShowAllPatientResults(false);
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    setName("");
    setPhone("");
  };

  const attendeeName = mode === "registered" ? selectedPatient?.name ?? "" : name.trim();
  const attendeePhone = mode === "registered" ? selectedPatient?.phone ?? "" : phone.trim();

  const ready =
    therapyId !== "" &&
    attendeeName !== "" &&
    (mode === "registered" ? !!selectedPatient : phone.trim() === "" || isValidUSPhone(phone));

  const calLink = useMemo(() => {
    if (!ready) return "";
    const therapy = THERAPIES.find((t) => t.id === therapyId);
    if (!therapy) return "";
    return `${CAL_USERNAME}/${calSlugForAdmin(therapy, location)}`;
  }, [ready, therapyId, location]);

  // Cal.com precarga el formulario con estos valores vía el objeto `config`
  // del embed — no sirve pegarlos como query string al final del calLink.
  const bookingPrefill = useMemo(() => {
    const noteLines: string[] = [];
    if (attendeePhone) noteLines.push(`Tel: ${formatUSPhone(attendeePhone)}`);
    if (mode === "registered") noteLines.push("Paciente registrado en el sistema");
    noteLines.push("Reserva manual — pago coordinado directamente (Zelle/efectivo), sin cobro en línea.");
    if (notes.trim()) noteLines.push(notes.trim());

    // El email se fuerza vacío a propósito — no tenemos el del paciente, y
    // sin esto Cal.com/el navegador a veces lo autocompletan con el correo
    // de la cuenta de RenaSER.
    const prefill: Record<string, string> = { name: attendeeName, email: "", notes: noteLines.join(" · ") };
    if (attendeePhone && isValidUSPhone(attendeePhone)) {
      prefill.attendeePhoneNumber = toE164USPhone(attendeePhone);
    }
    return prefill;
  }, [attendeeName, attendeePhone, mode, notes]);

  // Link a la ficha de paciente para enviar por fuera de Cal.com — útil
  // cuando la reserva ya se coordinó manualmente (por teléfono, en persona,
  // etc.) y solo falta que la persona firme su consentimiento.
  const fichaUrl = useMemo(() => {
    if (!therapyId) return "";
    return `${window.location.origin}/ficha-paciente?therapyId=${therapyId}&location=${location}`;
  }, [therapyId, location]);

  const fichaWhatsappLink = useMemo(() => {
    if (!fichaUrl || !attendeePhone || !isValidUSPhone(attendeePhone)) return "";
    const digits = attendeePhone.replace(/\D/g, "");
    const withCountryCode = digits.length === 10 ? `1${digits}` : digits;
    const firstName = attendeeName.split(" ")[0];
    const message = `Hola${firstName ? ` ${firstName}` : ""}, antes de tu sesión en RenaSER por favor completa tu ficha de paciente aquí: ${fichaUrl}`;
    return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
  }, [fichaUrl, attendeePhone, attendeeName]);

  const copyFichaLink = async () => {
    if (!fichaUrl) return;
    await navigator.clipboard.writeText(fichaUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleBookClick = async () => {
    if (!ready || !calLink) return;
    setBookingError("");
    setBookingSuccessMessage("");
    setBooking(true);

    const shouldCreatePatient = mode === "new" && createPatientRecord;
    const pendingName = attendeeName;
    const pendingPhone = attendeePhone;
    const pendingPhotoFile = photoFile;

    try {
      await openBookingModal(calLink, bookingPrefill, async () => {
        if (!shouldCreatePatient) return;
        try {
          await createPatient({
            name: pendingName,
            phone: pendingPhone || undefined,
            photoFile: pendingPhotoFile ?? undefined,
          });
          if (!mountedRef.current) return;
          setPatients(await listPatients());
          setBookingSuccessMessage("Reserva confirmada y ficha de paciente creada.");
        } catch {
          if (mountedRef.current) {
            setBookingError("La reserva se completó, pero no se pudo crear la ficha del paciente.");
          }
        }
      });
    } catch {
      setBookingError("No se pudo abrir el calendario de Cal.com. Intenta de nuevo.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <h1>Reservar cita manualmente</h1>
      <p className={styles.hint}>
        Se abrirá el calendario real de Cal.com para elegir la fecha y hora, ya con los datos de la persona
        precargados. Esta reserva no pide pago en línea — el depósito se coordina directamente con el cliente
        (Zelle/efectivo).
      </p>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === "registered" ? styles.tabActive : ""}`}
            onClick={() => switchMode("registered")}
          >
            Paciente registrado
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === "new" ? styles.tabActive : ""}`}
            onClick={() => switchMode("new")}
          >
            Persona no registrada
          </button>
        </div>

        {mode === "registered" ? (
          selectedPatient ? (
            <div className={styles.selectedPatient}>
              <div className={styles.avatar}>
                {selectedPatient.photoUrl ? (
                  <img src={selectedPatient.photoUrl} alt={selectedPatient.name} />
                ) : (
                  <span>{selectedPatient.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className={styles.selectedInfo}>
                <p className={styles.selectedName}>{selectedPatient.name}</p>
                {selectedPatient.phone && (
                  <p className={styles.selectedPhone}>{formatUSPhone(selectedPatient.phone)}</p>
                )}
              </div>
              <button type="button" className={styles.changeButton} onClick={clearSelectedPatient}>
                Cambiar
              </button>
            </div>
          ) : (
            <div className={styles.field}>
              <span>Buscar paciente por nombre</span>
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setShowAllPatientResults(false);
                }}
                onFocus={() => setPatientDropdownOpen(true)}
                onBlur={() => setTimeout(() => setPatientDropdownOpen(false), 150)}
                placeholder="Escribir para buscar…"
              />
              {patientDropdownOpen && filteredPatients.length > 0 && (
                <ul className={styles.results}>
                  {filteredPatients.map((p) => (
                    <li key={p.id}>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => selectPatient(p)}>
                        {p.name}
                      </button>
                    </li>
                  ))}
                  {hiddenPatientCount > 0 && (
                    <li>
                      <button
                        type="button"
                        className={styles.moreResultsButton}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowAllPatientResults(true)}
                      >
                        Buscar más ({hiddenPatientCount} más)
                      </button>
                    </li>
                  )}
                </ul>
              )}
              {patientDropdownOpen && filteredPatients.length === 0 && (
                <p className={styles.noResults}>
                  {patients.length === 0
                    ? "Todavía no hay pacientes registrados."
                    : 'Sin resultados. Prueba con "Persona sin ficha".'}
                </p>
              )}
            </div>
          )
        ) : (
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Nombre completo *</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className={styles.field}>
              <span>Teléfono</span>
              <input
                type="tel"
                placeholder="(702) 468-9914"
                value={phone}
                onChange={(e) => {
                  setPhone(formatUSPhone(e.target.value));
                  if (phoneError) setPhoneError("");
                }}
                onBlur={() => {
                  if (phone.trim() && !isValidUSPhone(phone)) {
                    setPhoneError("Ingresa un número de teléfono de EEUU válido (10 dígitos).");
                  }
                }}
              />
              {phoneError && <span className={styles.fieldError}>{phoneError}</span>}
            </label>
          </div>
        )}

        {mode === "new" && (
          <>
            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={createPatientRecord}
                onChange={(e) => setCreatePatientRecord(e.target.checked)}
              />
              <span>Crear ficha de paciente también</span>
            </label>

            {createPatientRecord && (
              <label className={styles.photoField}>
                <div className={styles.photoPreview}>
                  {photoPreview ? <img src={photoPreview} alt="Vista previa" /> : <span>Foto</span>}
                </div>
                <div>
                  <input type="file" accept="image/*" onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)} />
                  <p className={styles.photoHint}>Opcional — puedes agregarla después desde su ficha.</p>
                </div>
              </label>
            )}
          </>
        )}

        <label className={styles.field}>
          <span>Ciudad</span>
          <div className={styles.tabs}>
            {LOCATIONS.map((l) => (
              <button
                key={l.key}
                type="button"
                className={`${styles.tab} ${location === l.key ? styles.tabActive : ""}`}
                onClick={() => changeLocation(l.key)}
              >
                {l.name}
              </button>
            ))}
          </div>
        </label>

        <label className={styles.field}>
          <span>Terapia</span>
          <select value={therapyId} onChange={(e) => setTherapyId(e.target.value)}>
            {therapiesForLocation.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {therapiesForLocation.length === 0 && (
            <span className={styles.fieldError}>No hay terapias configuradas para esta ciudad.</span>
          )}
        </label>

        <label className={styles.field}>
          <span>Notas para el terapeuta (opcional)</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>

        {bookingError && <p className={styles.error}>{bookingError}</p>}
        {bookingSuccessMessage && <p className={styles.hint}>{bookingSuccessMessage}</p>}

        <div className={styles.actions}>
          {fichaUrl &&
            (fichaWhatsappLink ? (
              <a href={fichaWhatsappLink} target="_blank" rel="noreferrer" className={styles.fichaButton}>
                💬 Enviar ficha por WhatsApp
              </a>
            ) : (
              <button type="button" className={styles.fichaButton} onClick={copyFichaLink}>
                {linkCopied ? "✅ ¡Link copiado!" : "📋 Copiar link de la ficha"}
              </button>
            ))}

          {ready ? (
            <button type="button" className={styles.bookButton} onClick={handleBookClick} disabled={booking}>
              {booking ? "Guardando…" : "Elegir fecha y hora en Cal.com"}
            </button>
          ) : (
            <button type="button" className={styles.bookButton} disabled>
              Completa los datos para continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
