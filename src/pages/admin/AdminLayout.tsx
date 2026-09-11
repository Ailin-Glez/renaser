import { useEffect } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { initCal } from "../../lib/cal";
import styles from "./AdminLayout.module.css";

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    initCal();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Cargando…</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.inner}>
          <NavLink to="/admin" end className={styles.brand}>
            Renaser · Admin
          </NavLink>
          <button type="button" className={styles.logout} onClick={() => logout()}>
            Salir
          </button>
        </div>
        <nav className={styles.nav}>
          <div className={styles.navInner}>
            <NavLink
              to="/admin"
              className={`${styles.link} ${
                location.pathname === "/admin" || location.pathname.startsWith("/admin/pacientes")
                  ? styles.linkActive
                  : ""
              }`}
            >
              Pacientes
            </NavLink>
            <NavLink
              to="/admin/reservar"
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ""}`}
            >
              Reservar cita
            </NavLink>
            <NavLink
              to="/admin/resenas"
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ""}`}
            >
              Testimonios
            </NavLink>
            <NavLink
              to="/admin/gira-miami"
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ""}`}
            >
              Gira Miami
            </NavLink>
          </div>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
