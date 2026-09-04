import { SITE } from "../data/content";
import styles from "./Footer.module.css";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20l1.1-3.9A7.9 7.9 0 1 1 8.4 19L4 20Z" />
      <path d="M9 10.5c0 3 2.5 5.5 5.5 5.5" strokeLinecap="round" />
      <path d="M9 10.5c-.6-.6-.5-2 .3-2s.7 1 1.1 1.7c.3.5-.6 1-.3 1.6.4.8 1.2 1.6 2 2 .6.3 1.1-.6 1.6-.3.7.4 1.7.5 1.7 1.1s-1.4.9-2 .3" />
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
            <a
              className={styles.row}
              href={`https://wa.me/${SITE.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className={styles.icon}>
                <WhatsAppIcon />
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
