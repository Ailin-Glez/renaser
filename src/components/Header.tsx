import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../assets/renaser-logo.jpg";
import { SITE } from "../data/content";
import styles from "./Header.module.css";

const LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/terapias", label: "Terapias" },
  { to: "/terapeutas", label: "Nosotros" },
  { to: "/preguntas-frecuentes", label: "Preguntas" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      const threshold = isHome ? window.innerHeight * 0.55 : 24;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const hidden = isHome && !scrolled;

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${hidden ? styles.hidden : ""}`}
    >
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" className={styles.brand} onClick={() => setOpen(false)}>
          <img src={logo} alt={`${SITE.name} logo`} className={styles.logo} />
          <span>{SITE.name}</span>
        </NavLink>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`}>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ""}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/terapias" className={styles.cta} onClick={() => setOpen(false)}>
            Reservar
          </NavLink>
        </nav>

        <button
          className={`${styles.toggle} ${open ? styles.toggleOpen : ""}`}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      <svg className={styles.wave} viewBox="0 0 1200 10" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,0 L1200,0 L1200,5 C1100,3 1000,2 900,5 C750,8 600,8 450,5 C300,2 150,8 0,5 Z" />
      </svg>
    </header>
  );
}
