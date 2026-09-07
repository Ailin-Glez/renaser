import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/renaser-logo.jpg";
import { Button } from "../components/Button";
import { Leaves } from "../components/Leaves";
import { SectionHeading } from "../components/SectionHeading";
import { FamilyCard } from "../components/FamilyCard";
import { TestimonialOrbs } from "../components/TestimonialOrbs";
import {
  BOOKING_ENABLED,
  FAMILIES,
  SITE,
  MISSION_TEXT,
  ABOUT_QUOTE,
  TESTIMONIALS,
  TESTIMONIALS_ENABLED,
} from "../data/content";
import { usePageMeta } from "../hooks/usePageMeta";
import styles from "./Home.module.css";

// Cargado aparte: solo quien hace clic en "Comparte tu testimonio" necesita
// descargar Firestore, no todos los visitantes del Inicio.
const ReviewFormModal = lazy(() =>
  import("../components/ReviewFormModal").then((m) => ({ default: m.ReviewFormModal }))
);

// TODO: usando los testimonios de ejemplo (TESTIMONIALS) para previsualizar
// cómo se ven varios círculos a la vez. Cuando haya suficientes reseñas
// reales aprobadas, volver a traerlas con listApprovedReviews().
export default function Home() {
  usePageMeta(
    "",
    "RenaSER — terapias holísticas para renacer en cuerpo, mente y espíritu. Reiki, LNT, sonoterapia y más en Las Vegas y Miami."
  );
  const [testimonials] = useState(TESTIMONIALS);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

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
            <Button to="/terapias">{BOOKING_ENABLED ? "Reservar sesión" : "Ver terapias"}</Button>
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

      {TESTIMONIALS_ENABLED && (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className="container">
            <SectionHeading
              eyebrow="Testimonios"
              title="Lo que dicen quienes ya vivieron la experiencia"
              nowrap
            />
            <TestimonialOrbs testimonials={testimonials} />
            <div className={styles.reviewCta}>
              <Button variant="secondary" onClick={() => setReviewFormOpen(true)}>
                Comparte tu testimonio
              </Button>
            </div>
          </div>
        </section>
      )}

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

      {reviewFormOpen && (
        <Suspense fallback={null}>
          <ReviewFormModal onClose={() => setReviewFormOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
