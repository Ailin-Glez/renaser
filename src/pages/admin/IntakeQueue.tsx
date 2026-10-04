import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminModal } from "../../components/admin/AdminModal";
import { ConfirmModal } from "../../components/admin/ConfirmModal";
import { PatientsSubNav } from "../../components/admin/PatientsSubNav";
import { createPatient, listPatients, updatePatient, type Patient } from "../../lib/patients";
import { formatUSPhone } from "../../lib/phone";
import {
  deleteIntakeForm,
  linkIntakeFormToPatient,
  listIntakeForms,
  type IntakeFormSubmission,
} from "../../lib/intakeForms";
import styles from "./IntakeQueue.module.css";

const FILTERS: { key: "pending" | "processed" | "all"; label: string }[] = [
  { key: "pending", label: "Pendientes" },
  { key: "processed", label: "Procesadas" },
  { key: "all", label: "Todas" },
];

// Resume en una línea los datos de salud relevantes de la ficha, para
// prellenar las alertas del paciente al convertirla.
function buildAlertsSummary(f: IntakeFormSubmission): string {
  const lines: string[] = [];
  if (f.hasEssentialOilAllergy) lines.push(`Alergia a aceites esenciales${f.allergyEssentialOils ? `: ${f.allergyEssentialOils}` : ""}`);
  if (f.hasHerbsPlantsAllergy) lines.push(`Alergia a hierbas/plantas${f.allergyHerbsPlants ? `: ${f.allergyHerbsPlants}` : ""}`);
  if (f.hasSageIncenseAllergy) lines.push(`Alergia a sage/incienso${f.allergySageIncenseSmoke ? `: ${f.allergySageIncenseSmoke}` : ""}`);
  if (f.hasFragranceAllergy) lines.push(`Alergia a fragancias${f.allergyFragrances ? `: ${f.allergyFragrances}` : ""}`);
  if (f.allergyOther) lines.push(`Otras alergias: ${f.allergyOther}`);
  if (f.hasPacemaker) lines.push("Marcapasos/dispositivo médico implantado");
  if (f.hasMetalImplants) lines.push("Implantes metálicos");
  if (f.isPregnant) lines.push(`Embarazo${f.pregnancyWeeks ? ` (${f.pregnancyWeeks} semanas)` : ""}`);
  if (f.hasHeartCondition) lines.push("Condición cardíaca");
  if (f.hasBloodPressureIssue) lines.push("Presión arterial alta o baja");
  if (f.hasEpilepsy) lines.push("Epilepsia o convulsiones");
  if (f.hasCancer) lines.push("Cáncer actual o en tratamiento");
  if (f.hasDiabetes) lines.push("Diabetes");
  if (f.hasPsychiatricCondition) lines.push("Trastorno psiquiátrico/psicológico actual");
  if (f.hasChronicPain) lines.push("Dolor crónico");
  if (f.hasRespiratoryIssue) lines.push("Problemas respiratorios/asma");
  if (f.otherCondition) lines.push(f.otherCondition);
  if (f.currentMedications) lines.push(`Medicamentos: ${f.currentMedications}`);
  return lines.join(" · ");
}

function hasAnyAlert(f: IntakeFormSubmission): boolean {
  return buildAlertsSummary(f).length > 0;
}

export default function IntakeQueue() {
  const [forms, setForms] = useState<IntakeFormSubmission[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "processed" | "all">("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [linkTargetForm, setLinkTargetForm] = useState<IntakeFormSubmission | null>(null);
  const [linkSearch, setLinkSearch] = useState("");

  function refresh() {
    setLoading(true);
    Promise.all([listIntakeForms(), listPatients()])
      .then(([f, p]) => {
        setForms(f);
        setPatients(p);
      })
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function convertToPatient(f: IntakeFormSubmission) {
    setBusyId(f.id);
    setSuccessMsg("");
    try {
      const patientId = await createPatient({
        name: f.fullName,
        phone: f.phone,
        alerts: buildAlertsSummary(f) || undefined,
        photoUrl: f.photoUrl || undefined,
        latestIntakeFormId: f.id,
      });
      await linkIntakeFormToPatient(f.id, patientId);
      setForms((prev) => prev.map((x) => (x.id === f.id ? { ...x, processed: true, linkedPatientId: patientId } : x)));
      setPatients(await listPatients());
      setSuccessMsg(`Paciente "${f.fullName}" creado correctamente.`);
    } finally {
      setBusyId(null);
    }
  }

  async function linkToExistingPatient(f: IntakeFormSubmission, patient: Patient) {
    setBusyId(f.id);
    setSuccessMsg("");
    try {
      await updatePatient(patient.id, {
        alerts: buildAlertsSummary(f) || undefined,
        photoUrl: f.photoUrl || undefined,
        latestIntakeFormId: f.id,
      });
      await linkIntakeFormToPatient(f.id, patient.id);
      setForms((prev) => prev.map((x) => (x.id === f.id ? { ...x, processed: true, linkedPatientId: patient.id } : x)));
      setLinkTargetForm(null);
      setLinkSearch("");
      setSuccessMsg(`Ficha vinculada a "${patient.name}" — sus datos quedaron actualizados.`);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setConfirmDeleteId(null);
    setBusyId(id);
    try {
      await deleteIntakeForm(id);
      setForms((prev) => prev.filter((f) => f.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  const filtered = forms.filter((f) => {
    if (filter === "pending") return !f.processed;
    if (filter === "processed") return f.processed;
    return true;
  });
  const pendingCount = forms.filter((f) => !f.processed).length;

  const linkSearchResults = useMemo(() => {
    const q = linkSearch.trim().toLowerCase();
    if (!q) return patients.slice(0, 8);
    return patients.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [patients, linkSearch]);

  return (
    <div>
      <div className={styles.toolbar}>
        <h1>Fichas de pacientes</h1>
      </div>

      <PatientsSubNav pendingFichas={pendingCount} />

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`${styles.filterButton} ${filter === f.key ? styles.filterActive : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === "pending" && pendingCount > 0 && <span className={styles.badge}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      {successMsg && <p className={styles.success}>{successMsg}</p>}
      {loading && <p className={styles.empty}>Cargando…</p>}
      {!loading && filtered.length === 0 && <p className={styles.empty}>No hay fichas en esta categoría.</p>}

      <div className={styles.list}>
        {filtered.map((f) => {
          const expanded = expandedId === f.id;
          const alertsSummary = buildAlertsSummary(f);
          const linkedPatient = f.linkedPatientId ? patients.find((p) => p.id === f.linkedPatientId) : undefined;
          const submittedAt = f.createdAt?.toDate().toLocaleString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });

          return (
            <div key={f.id} className={`${styles.card} ${f.processed ? styles.cardProcessed : ""}`}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.name}>{f.fullName}</span>
                  {f.phone && <span className={styles.phone}>{formatUSPhone(f.phone)}</span>}
                </div>
                <span className={`${styles.status} ${f.processed ? styles.processed : styles.pending}`}>
                  {f.processed ? "Procesada" : "Pendiente"}
                </span>
              </div>

              {submittedAt && <p className={styles.submittedNote}>Enviada el {submittedAt}</p>}

              {f.therapyName && (
                <p className={styles.therapyNote}>
                  🗓️ {f.therapyName}
                  {f.therapyLocation && ` — ${f.therapyLocation}`}
                </p>
              )}

              {f.processed && (
                <p className={styles.linkedNote}>
                  {linkedPatient ? (
                    <>
                      ✓ Vinculada al paciente{" "}
                      <Link to={`/admin/pacientes/${linkedPatient.id}`}>{linkedPatient.name}</Link>
                    </>
                  ) : (
                    "✓ Ya procesada."
                  )}
                </p>
              )}

              {hasAnyAlert(f) && (
                <p className={styles.alertNote}>⚠️ {alertsSummary}</p>
              )}

              <button type="button" className={styles.toggleDetails} onClick={() => setExpandedId(expanded ? null : f.id)}>
                {expanded ? "Ocultar detalles ▲" : "Ver ficha completa ▼"}
              </button>

              {expanded && (
                <div className={styles.details}>
                  {f.email && <p><strong>Correo:</strong> {f.email}</p>}
                  {f.birthDate && <p><strong>Fecha de nacimiento:</strong> {f.birthDate}</p>}
                  {f.address && <p><strong>Dirección:</strong> {f.address}</p>}
                  {(f.city || f.state) && <p><strong>Ciudad/Estado:</strong> {[f.city, f.state].filter(Boolean).join(", ")}</p>}
                  {f.emergencyContactName && <p><strong>Contacto de emergencia:</strong> {f.emergencyContactName} {f.emergencyContactPhone && formatUSPhone(f.emergencyContactPhone)}</p>}
                  {f.hadPreviousTherapy && <p><strong>Experiencia previa:</strong> {f.previousTherapyDetails || "Sí"}</p>}
                  {f.currentConditions && <p><strong>Condiciones médicas:</strong> {f.currentConditions}</p>}
                  {f.surgeriesOrInjuries && <p><strong>Cirugías/lesiones:</strong> {f.surgeriesOrInjuries}</p>}
                  {f.authorizedTechniques.length > 0 && <p><strong>Técnicas autorizadas:</strong> {f.authorizedTechniques.join(", ")}</p>}
                  {f.otherTechnique && <p><strong>Otra técnica:</strong> {f.otherTechnique}</p>}
                  <p><strong>Terapeuta:</strong> {f.therapist === "ambos" ? "Martha González y Carlos Laurenti" : f.therapist === "martha" ? "Martha González" : "Carlos Laurenti"}</p>
                  {f.photoUrl && <img src={f.photoUrl} alt={f.fullName} className={styles.photo} />}
                  <img src={f.signatureDataUrl} alt="Firma" className={styles.signature} />
                </div>
              )}

              {!f.processed && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.convertButton}
                    disabled={busyId === f.id}
                    onClick={() => convertToPatient(f)}
                  >
                    Crear paciente
                  </button>
                  <button
                    type="button"
                    className={styles.linkButton}
                    disabled={busyId === f.id}
                    onClick={() => setLinkTargetForm(f)}
                  >
                    Actualizar paciente existente
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    disabled={busyId === f.id}
                    onClick={() => setConfirmDeleteId(f.id)}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmDeleteId && (
        <ConfirmModal
          title="Eliminar ficha"
          message="¿Eliminar esta ficha permanentemente? Esta acción no se puede deshacer."
          onConfirm={() => remove(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {linkTargetForm && (
        <AdminModal
          title={`Actualizar paciente existente — ${linkTargetForm.fullName}`}
          onClose={() => {
            setLinkTargetForm(null);
            setLinkSearch("");
          }}
        >
          <p className={styles.linkModalNote}>
            Esto actualiza las alertas y la foto del paciente seleccionado con los datos de esta ficha nueva.
          </p>
          <input
            type="search"
            placeholder="Buscar paciente por nombre…"
            value={linkSearch}
            onChange={(e) => setLinkSearch(e.target.value)}
            className={styles.linkSearch}
            autoFocus
          />
          <div className={styles.linkResults}>
            {linkSearchResults.length === 0 && <p className={styles.empty}>Sin resultados.</p>}
            {linkSearchResults.map((p) => (
              <button
                key={p.id}
                type="button"
                className={styles.linkResultItem}
                disabled={busyId === linkTargetForm.id}
                onClick={() => linkToExistingPatient(linkTargetForm, p)}
              >
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt={p.name} />
                ) : (
                  <span className={styles.linkResultAvatar}>{p.name.charAt(0).toUpperCase()}</span>
                )}
                <span>
                  <strong>{p.name}</strong>
                  {p.phone && <span className={styles.linkResultPhone}> {formatUSPhone(p.phone)}</span>}
                </span>
              </button>
            ))}
          </div>
        </AdminModal>
      )}
    </div>
  );
}
