import { NavLink } from "react-router-dom";
import styles from "./PatientsSubNav.module.css";

export function PatientsSubNav({ pendingFichas = 0 }: { pendingFichas?: number }) {
  return (
    <div className={styles.subNav}>
      <NavLink to="/admin" end className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ""}`}>
        Lista de pacientes
      </NavLink>
      <NavLink
        to="/admin/fichas"
        className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ""}`}
      >
        Fichas nuevas
        {pendingFichas > 0 && <span className={styles.badge}>{pendingFichas}</span>}
      </NavLink>
    </div>
  );
}
