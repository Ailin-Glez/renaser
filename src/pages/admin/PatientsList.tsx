import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listPatients, type Patient } from "../../lib/patients";
import { formatUSPhone } from "../../lib/phone";
import styles from "./PatientsList.module.css";

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    listPatients()
      .then(setPatients)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patients, search]);

  return (
    <div>
      <div className={styles.toolbar}>
        <h1>Pacientes</h1>
        <Link to="/admin/pacientes/nuevo" className={styles.newButton}>
          + Nuevo paciente
        </Link>
      </div>

      <input
        type="search"
        placeholder="Buscar por nombre…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.search}
      />

      {loading && <p className={styles.empty}>Cargando…</p>}

      {!loading && filtered.length === 0 && (
        <p className={styles.empty}>
          {patients.length === 0 ? "Todavía no hay pacientes registrados." : "Sin resultados."}
        </p>
      )}

      <div className={styles.grid}>
        {filtered.map((patient) => (
          <Link key={patient.id} to={`/admin/pacientes/${patient.id}`} className={styles.card}>
            <div className={styles.avatar}>
              {patient.photoUrl ? (
                <img src={patient.photoUrl} alt={patient.name} />
              ) : (
                <span>{patient.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className={styles.name}>{patient.name}</p>
              {patient.phone && <p className={styles.phone}>{formatUSPhone(patient.phone)}</p>}
              {patient.alerts && <p className={styles.alert}>{patient.alerts}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
