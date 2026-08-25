import { Link } from "react-router-dom";
import logo from "../assets/renaser-logo.jpg";
import { Button } from "../components/Button";
import { Leaves } from "../components/Leaves";
import { SectionHeading } from "../components/SectionHeading";
import { TherapyCard } from "../components/TherapyCard";
import { TestimonialMarquee } from "../components/TestimonialMarquee";
import { SITE, MISSION_TEXT, THERAPIES, TESTIMONIALS } from "../data/content";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <Leaves />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBrand}>
            <img src={logo} alt={`${SITE.name} logo`} className={styles.heroLogo} />
          </div>
          <h1>{SITE.tagline}</h1>
          <p className={styles.heroText}>{SITE.aboutShort}</p>
          <div className={styles.heroActions}>
            <Button to="/reservas">Reservar sesión</Button>
            <Button to="/terapias" variant="secondary">
              Ver terapias
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.mission}>
        <span className={styles.missionBlob} aria-hidden="true" />
        <div className={`container ${styles.missionWrap}`}>
          <span className={styles.missionEyebrow}>¿Qué es RenaSER?</span>
          <p className={styles.missionText}>{MISSION_TEXT}</p>
          <span className={styles.mottoPill}>{SITE.motto}</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <SectionHeading
            eyebrow="Terapias"
            title="Un espacio para cada tipo de sanación"
            description="Cada terapia está pensada para acompañarte en un momento distinto de tu proceso."
            nowrap
          />
          <div className={styles.grid}>
            {THERAPIES.slice(0, 3).map((therapy) => (
              <TherapyCard key={therapy.id} therapy={therapy} />
            ))}
          </div>
          <div className={styles.seeMore}>
            <Link to="/terapias" className={styles.moreLink}>
              Ver todas las terapias <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.blobLeft} aria-hidden="true" />
        <div className="container">
          <SectionHeading
            eyebrow="Testimonios"
            title="Lo que dicen quienes ya vivieron la experiencia"
            nowrap
          />
          <TestimonialMarquee testimonials={TESTIMONIALS} />
        </div>
      </section>
    </>
  );
}
