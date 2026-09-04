import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminModal } from "../../components/admin/AdminModal";
import { ConfirmModal } from "../../components/admin/ConfirmModal";
import { ExpandableText } from "../../components/admin/ExpandableText";
import { PhotoLightbox } from "../../components/admin/PhotoLightbox";
import { THERAPIES, THERAPISTS } from "../../data/content";
import { formatDateLong } from "../../lib/dates";
import { formatUSPhone, isValidUSPhone, whatsappLink } from "../../lib/phone";
import {
  addVisit,
  deletePatient,
  deleteVisit,
  getPatient,
  listVisits,
  updatePatient,
  updateVisit,
  type Patient,
  type Visit,
} from "../../lib/patients";
import styles from "./PatientDetail.module.css";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [alerts, setAlerts] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [savingPatient, setSavingPatient] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [visitDate, setVisitDate] = useState(todayISO());
  const [therapyId, setTherapyId] = useState(THERAPIES[0]?.id ?? "");
  const [therapist, setTherapist] = useState("");
  const [notes, setNotes] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [savingVisit, setSavingVisit] = useState(false);
  const [visitFormError, setVisitFormError] = useState("");

  const [confirmDeletePatient, setConfirmDeletePatient] = useState(false);
  const [confirmDeleteVisitId, setConfirmDeleteVisitId] = useState<string | null>(null);
  const [photoLightboxOpen, setPhotoLightboxOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getPatient(id), listVisits(id)]).then(([p, v]) => {
      setPatient(p);
      setVisits(v);
      if (p) {
        setName(p.name);
        setPhone(p.phone ? formatUSPhone(p.phone) : "");
        setAlerts(p.alerts ?? "");
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className={styles.empty}>Cargando…</p>;
  if (!patient || !id) return <p className={styles.empty}>Paciente no encontrado.</p>;

  const handlePhoto = (file: File | null) => {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSavePatient = async (event: FormEvent) => {
    event.preventDefault();

    if (phone.trim() && !isValidUSPhone(phone)) {
      setPhoneError("Ingresa un número de teléfono de EEUU válido (10 dígitos).");
      return;
    }
    setPhoneError("");

    setSavingPatient(true);
    await updatePatient(id, {
      name: name.trim(),
      phone: phone.trim(),
      alerts: alerts.trim(),
      photoFile: photoFile ?? undefined,
    });
    const refreshed = await getPatient(id);
    setPatient(refreshed);
    setPhotoFile(null);
    setPhotoPreview(null);
    setSavingPatient(false);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setName(patient.name);
    setPhone(patient.phone ? formatUSPhone(patient.phone) : "");
    setAlerts(patient.alerts ?? "");
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhoneError("");
    setEditing(false);
  };

  const handleDeletePatient = async () => {
    setConfirmDeletePatient(false);
    await deletePatient(id);
    navigate("/admin");
  };

  const resetVisitForm = () => {
    setEditingVisitId(null);
    setVisitDate(todayISO());
    setTherapyId(THERAPIES[0]?.id ?? "");
    setTherapist("");
    setNotes("");
    setRecommendations("");
    setVisitFormError("");
  };

  const openNewVisitModal = () => {
    resetVisitForm();
    setVisitModalOpen(true);
  };

  const openEditVisitModal = (visit: Visit) => {
    setEditingVisitId(visit.id);
    setVisitDate(visit.date);
    setTherapyId(visit.therapyId ?? THERAPIES[0]?.id ?? "");
    setTherapist(visit.therapist ?? "");
    setNotes(visit.notes ?? "");
    setRecommendations(visit.recommendations ?? "");
    setVisitFormError("");
    setVisitModalOpen(true);
  };

  const handleSaveVisit = async (event: FormEvent) => {
    event.preventDefault();

    if (!visitDate) {
      setVisitFormError("Selecciona una fecha para la visita.");
      return;
    }
    if (!therapyId) {
      setVisitFormError("Selecciona una terapia.");
      return;
    }
    setVisitFormError("");

    const therapy = THERAPIES.find((t) => t.id === therapyId);
    setSavingVisit(true);
    const payload = {
      date: visitDate,
      therapyId,
      therapyName: therapy?.name ?? therapyId,
      therapist: therapist || undefined,
      notes: notes.trim() || undefined,
      recommendations: recommendations.trim() || undefined,
    };
    if (editingVisitId) {
      await updateVisit(id, editingVisitId, payload);
    } else {
      await addVisit(id, payload);
    }
    setVisits(await listVisits(id));
    setSavingVisit(false);
    setVisitModalOpen(false);
    resetVisitForm();
  };

  const handleDeleteVisit = async () => {
    if (!confirmDeleteVisitId) return;
    await deleteVisit(id, confirmDeleteVisitId);
    setConfirmDeleteVisitId(null);
    setVisits(await listVisits(id));
  };

  return (
    <div>
      <Link to="/admin" className={styles.back}>
        ← Pacientes
      </Link>

      <div className={styles.header}>
        <button
          type="button"
          className={styles.avatar}
          onClick={() => patient.photoUrl && setPhotoLightboxOpen(true)}
          disabled={!patient.photoUrl}
          aria-label={patient.photoUrl ? "Ver foto en grande" : undefined}
        >
          {patient.photoUrl ? (
            <img src={patient.photoUrl} alt={patient.name} />
          ) : (
            <span>{patient.name.charAt(0).toUpperCase()}</span>
          )}
        </button>
        <div className={styles.headerInfo}>
          <h1>{patient.name}</h1>
          {patient.phone && (
            <a
              href={whatsappLink(patient.phone)}
              target="_blank"
              rel="noreferrer"
              className={styles.phone}
              title="Escribir por WhatsApp"
            >
              <svg
                className={styles.whatsappIcon}
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a7.9 7.9 0 0 1-2.3-1.4 8.6 8.6 0 0 1-1.6-2c-.2-.3 0-.4.1-.6l.4-.5.2-.4a.5.5 0 0 0 0-.4c-.1-.1-.7-1.6-.9-2.2s-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.4 5.9 5.9 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c.7.3 1.3.5 1.7.6a4.1 4.1 0 0 0 1.9.1 3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.1-.3-.2-.6-.3Z" />
                <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
              </svg>
              {formatUSPhone(patient.phone)}
            </a>
          )}
        </div>
        {!editing && (
          <div className={styles.headerActions}>
            <button type="button" className={styles.editButton} onClick={() => setEditing(true)}>
              Editar datos
            </button>
            <button type="button" className={styles.deleteButton} onClick={() => setConfirmDeletePatient(true)}>
              Eliminar
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form className={styles.editForm} onSubmit={handleSavePatient}>
          <label className={styles.photoField}>
            <div className={styles.photoPreview}>
              {photoPreview ? (
                <img src={photoPreview} alt="Vista previa" />
              ) : patient.photoUrl ? (
                <img src={patient.photoUrl} alt={patient.name} />
              ) : (
                <span>Foto</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)} />
          </label>

          <label className={styles.field}>
            <span>Nombre completo</span>
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
            />
            {phoneError && <span className={styles.fieldError}>{phoneError}</span>}
          </label>

          <label className={`${styles.field} ${styles.notesField}`}>
            <span>Notas</span>
            <textarea value={alerts} onChange={(e) => setAlerts(e.target.value)} rows={4} />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={handleCancelEdit}>
              Cancelar
            </button>
            <button type="submit" className={styles.submit} disabled={savingPatient}>
              {savingPatient ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      ) : (
        patient.alerts && (
          <div className={styles.notesCard}>
            <div className={styles.notesBlock}>
              <h2>Notas</h2>
              <ExpandableText text={patient.alerts} />
            </div>
          </div>
        )
      )}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>
            Historial de visitas
            <span className={styles.visitCount}>{visits.length}</span>
          </h2>
          <button type="button" className={styles.addVisitButton} onClick={openNewVisitModal}>
            + Agregar visita
          </button>
        </div>

        {visits.length === 0 && <p className={styles.empty}>Todavía no hay visitas registradas.</p>}
        <ul className={styles.timeline}>
          {visits.map((visit) => (
            <li key={visit.id} className={styles.visit}>
              <div className={styles.visitHead}>
                <div className={styles.visitMeta}>
                  <span className={styles.visitDate}>{formatDateLong(visit.date)}</span>
                  <span className={styles.visitTherapy}>{visit.therapyName}</span>
                </div>
                <div className={styles.visitActions}>
                  {visit.therapist && <span className={styles.visitTherapist}>{visit.therapist}</span>}
                  <button
                    type="button"
                    className={styles.visitEdit}
                    onClick={() => openEditVisitModal(visit)}
                    aria-label="Editar visita"
                  >
                    <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
                      <path
                        d="M13.5 3.5 16.5 6.5M4 16l.7-3.3L12.3 5.1a1.4 1.4 0 0 1 2 0l.6.6a1.4 1.4 0 0 1 0 2L7.3 15.3 4 16Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={styles.visitDelete}
                    onClick={() => setConfirmDeleteVisitId(visit.id)}
                    aria-label="Eliminar visita"
                  >
                    ×
                  </button>
                </div>
              </div>
              {visit.notes && (
                <div className={styles.visitNotes}>
                  <span className={styles.visitNotesLabel}>Notas</span>
                  <ExpandableText text={visit.notes} lines={2} />
                </div>
              )}
              {visit.recommendations && (
                <div className={styles.visitNotes}>
                  <span className={styles.visitNotesLabel}>Recomendaciones</span>
                  <ExpandableText text={visit.recommendations} lines={2} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {visitModalOpen && (
        <AdminModal
          title={editingVisitId ? "Editar visita" : "Agregar visita"}
          onClose={() => {
            setVisitModalOpen(false);
            resetVisitForm();
          }}
          wide
        >
          <form className={styles.visitForm} onSubmit={handleSaveVisit}>
            <label className={styles.field}>
              <span>Fecha *</span>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => {
                  setVisitDate(e.target.value);
                  if (visitFormError) setVisitFormError("");
                }}
                required
              />
            </label>

            <label className={styles.field}>
              <span>Terapia *</span>
              <select
                value={therapyId}
                onChange={(e) => {
                  setTherapyId(e.target.value);
                  if (visitFormError) setVisitFormError("");
                }}
                required
              >
                {THERAPIES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Terapeuta</span>
              <select value={therapist} onChange={(e) => setTherapist(e.target.value)}>
                <option value="">—</option>
                {THERAPISTS.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={`${styles.field} ${styles.notesField}`}>
              <span>Notas</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </label>

            <label className={`${styles.field} ${styles.notesField}`}>
              <span>Recomendaciones</span>
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                rows={3}
              />
            </label>

            {visitFormError && <p className={styles.formError}>{visitFormError}</p>}

            <div className={styles.actions}>
              <button type="submit" className={styles.submit} disabled={savingVisit}>
                {savingVisit ? "Guardando…" : editingVisitId ? "Guardar cambios" : "Agregar visita"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {confirmDeletePatient && (
        <ConfirmModal
          title="Eliminar paciente"
          message={`¿Eliminar a ${patient.name}? Esta acción no se puede deshacer.`}
          onConfirm={handleDeletePatient}
          onCancel={() => setConfirmDeletePatient(false)}
        />
      )}

      {confirmDeleteVisitId && (
        <ConfirmModal
          title="Eliminar visita"
          message="¿Eliminar esta visita? Esta acción no se puede deshacer."
          onConfirm={handleDeleteVisit}
          onCancel={() => setConfirmDeleteVisitId(null)}
        />
      )}

      {photoLightboxOpen && patient.photoUrl && (
        <PhotoLightbox src={patient.photoUrl} alt={patient.name} onClose={() => setPhotoLightboxOpen(false)} />
      )}
    </div>
  );
}
