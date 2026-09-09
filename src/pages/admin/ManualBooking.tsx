import { useEffect, useMemo, useState } from "react";
import { CAL_USERNAME, LOCATIONS, THERAPIES, calSlugForAdmin, type LocationKey } from "../../data/content";
import { CAL_NAMESPACE } from "../../lib/cal";
import { formatUSPhone, isValidUSPhone } from "../../lib/phone";
import { listPatients, type Patient } from "../../lib/patients";
import styles from "./ManualBooking.module.css";

type Mode = "registered" | "new";

export default function ManualBooking() {
  const [mode, setMode] = useState<Mode>("registered");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
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

  const changeLocation = (next: LocationKey) => {
    setLocation(next);
    const stillAvailable = THERAPIES.filter((t) => t.pricing[next]);
    setTherapyId(stillAvailable[0]?.id ?? "");
  };

  useEffect(() => {
    listPatients().then(setPatients);
  }, []);

  const filteredPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return [];
    return patients.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [patients, patientSearch]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setSelectedPatient(null);
    setPatientSearch("");
    setName("");
    setPhone("");
    setPhoneError("");
  };

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearch("");
    setName(patient.name);
    setPhone(patient.phone ?? "");
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

    const noteLines: string[] = [];
    if (attendeePhone) noteLines.push(`Tel: ${formatUSPhone(attendeePhone)}`);
    if (mode === "registered") noteLines.push("Paciente registrado en el sistema");
    noteLines.push("Reserva manual — pago coordinado directamente (Zelle/efectivo), sin cobro en línea.");
    if (notes.trim()) noteLines.push(notes.trim());

    const params = new URLSearchParams({ name: attendeeName });
    params.set("notes", noteLines.join(" · "));

    return `${CAL_USERNAME}/${calSlugForAdmin(therapy, location)}?${params.toString()}`;
  }, [ready, attendeeName, attendeePhone, mode, notes, therapyId, location]);

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
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Escribe un nombre…"
              />
              {filteredPatients.length > 0 && (
                <ul className={styles.results}>
                  {filteredPatients.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => selectPatient(p)}>
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {patientSearch.trim() && filteredPatients.length === 0 && (
                <p className={styles.noResults}>Sin resultados. Prueba con "Persona sin ficha".</p>
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

        <div className={styles.actions}>
          {ready ? (
            <button
              type="button"
              className={styles.bookButton}
              data-cal-namespace={CAL_NAMESPACE}
              data-cal-link={calLink}
            >
              Elegir fecha y hora en Cal.com
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
