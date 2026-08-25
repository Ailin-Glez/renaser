import portrait from "../assets/therapist-portrait.jpg";
import portraitAlt from "../assets/therapist-portrait-2.jpg";
import { ABOUT_TEXT, ABOUT_QUOTE, SITE } from "../data/content";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./About.module.css";

export default function About() {
  const altPhotoRef = useScrollReveal<HTMLDivElement>();
  const [introText, ...restText] = ABOUT_TEXT;

  return (
    <>
      <section className={styles.section}>
        <div className={`container ${styles.layout}`}>
          <div className={styles.photoCol}>
            <div className={styles.portrait}>
              <img src={portrait} alt={`Terapeuta de ${SITE.name}`} />
            </div>
            <div ref={altPhotoRef} className={`${styles.altPhoto} reveal`}>
              <img src={portraitAlt} alt={`${SITE.name} en sesión`} />
            </div>
          </div>

          <div className={styles.textCol}>
            <div className={styles.introBlock}>
              <span className={styles.eyebrow}>Sobre mí</span>
              <h1>Un camino dedicado a tu bienestar</h1>
              <p>{introText}</p>
            </div>

            <div className={styles.restBlock}>
              {restText.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.quoteSection}>
        <span className={styles.quoteBlob} aria-hidden="true" />
        <div className="container">
          <div className={styles.quoteWrap}>
            {ABOUT_QUOTE.slice(0, -1).map((line, i) => (
              <p key={i} className={styles.quoteLine}>
                {line}
              </p>
            ))}
            <span className={styles.quotePill}>{ABOUT_QUOTE[ABOUT_QUOTE.length - 1]}</span>
          </div>
        </div>
      </section>
    </>
  );
}
