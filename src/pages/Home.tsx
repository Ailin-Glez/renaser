import { Link } from "react-router-dom";
import logo from "../assets/renaser-logo.jpg";
import { Button } from "../components/Button";
import { Leaves } from "../components/Leaves";
import { SectionHeading } from "../components/SectionHeading";
import { FamilyCard } from "../components/FamilyCard";
import { TestimonialMarquee } from "../components/TestimonialMarquee";
import { FAMILIES, SITE, MISSION_TEXT, TESTIMONIALS } from "../data/content";
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
          <p className={styles.heroText}>
            Un espacio donde el Reiki se encuentra
            <br className={styles.mobileBreak} />
            {" con la mediumnidad,"}
            <br className={styles.desktopBreak} />
            {" y el cuidado del cuerpo con el del alma."}
          </p>
          <div className={styles.heroActions}>
            <Button to="/terapias">Reservar sesión</Button>
          </div>
        </div>
      </section>

      <section className={styles.mission}>
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
            title="Terapias Holísticas"
            description="Cada familia de terapias está pensada para acompañarte en un momento distinto de tu proceso."
          />
          <div className={styles.familyGrid}>
            {FAMILIES.map((family) => (
              <FamilyCard key={family.key} family={family} />
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
        <div className="container">
          <SectionHeading
            eyebrow="Testimonios"
            title="Lo que dicen quienes ya vivieron la experiencia"
          />
          <TestimonialMarquee testimonials={TESTIMONIALS} />
        </div>
      </section>
    </>
  );
}
