import { SITE } from "../data/content";
import styles from "./Footer.module.css";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.8 21 3 13.2 3 3.9 3 3.4 3.4 3 4 3h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 8h-2c-1.1 0-2 .9-2 2v2H9v3h2v6h3v-6h2.2l.8-3H14v-1.5c0-.6.4-.5 1-.5h1V8Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <svg
        className={styles.wave}
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,32 C200,64 400,0 600,20 C800,40 1000,64 1200,28 L1200,0 L0,0 Z"
          fill="var(--color-cream)"
        />
      </svg>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandCol}>
          <h4 className={styles.brandLine}>
            {SITE.name}
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.tagline}>{SITE.tagline}</span>
          </h4>
        </div>

        <div className={styles.connect}>
          <div className={styles.connectGrid}>
            <a className={styles.row} href={`tel:${SITE.phone.replace(/\s/g, "")}`}>
              <span className={styles.icon}>
                <PhoneIcon />
              </span>
              {SITE.phone}
            </a>
            <a className={styles.row} href={`mailto:${SITE.email}`}>
              <span className={styles.icon}>
                <MailIcon />
              </span>
              {SITE.email}
            </a>
            <a className={styles.row} href={SITE.facebookUrl} target="_blank" rel="noreferrer">
              <span className={styles.icon}>
                <FacebookIcon />
              </span>
              Facebook
            </a>
            <a className={styles.row} href={SITE.instagramUrl} target="_blank" rel="noreferrer">
              <span className={styles.icon}>
                <InstagramIcon />
              </span>
              Instagram
            </a>
          </div>
        </div>
      </div>

      <p className={styles.copy}>
        © {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
