import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createPatient } from "../../lib/patients";
import { formatUSPhone, isValidUSPhone } from "../../lib/phone";
import styles from "./PatientForm.module.css";

export default function PatientForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [alerts, setAlerts] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handlePhoto = (file: File | null) => {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    if (phone.trim() && !isValidUSPhone(phone)) {
      setPhoneError("Ingresa un número de teléfono de EEUU válido (10 dígitos).");
      return;
    }
    setPhoneError("");

    setSaving(true);
    setError("");
    try {
      const id = await createPatient({
        name: name.trim(),
        phone: phone.trim() || undefined,
        alerts: alerts.trim() || undefined,
        photoFile: photoFile ?? undefined,
      });
      navigate(`/admin/pacientes/${id}`);
    } catch {
      setError("No se pudo guardar el paciente. Intenta de nuevo.");
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <h1>Nuevo paciente</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.photoField}>
          <div className={styles.photoPreview}>
            {photoPreview ? <img src={photoPreview} alt="Vista previa" /> : <span>Foto</span>}
          </div>
          <input type="file" accept="image/*" onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)} />
        </label>

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
          />
          {phoneError && <span className={styles.fieldError}>{phoneError}</span>}
        </label>

        <label className={styles.field}>
          <span>Notas (embarazo, alergias, contraindicaciones…)</span>
          <textarea value={alerts} onChange={(e) => setAlerts(e.target.value)} rows={3} />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className={styles.submit} disabled={saving}>
            {saving ? "Guardando…" : "Guardar paciente"}
          </button>
        </div>
      </form>
    </div>
  );
}
