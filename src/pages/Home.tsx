import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/renaser-logo.jpg";
import { Button } from "../components/Button";
import { Leaves } from "../components/Leaves";
import { SectionHeading } from "../components/SectionHeading";
import { FamilyCard } from "../components/FamilyCard";
import { TestimonialMarquee } from "../components/TestimonialMarquee";
import { ReviewFormModal } from "../components/ReviewFormModal";
import { FAMILIES, SITE, MISSION_TEXT, TESTIMONIALS, type Testimonial } from "../data/content";
import { listApprovedReviews } from "../lib/reviews";
import styles from "./Home.module.css";

export default function Home() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  useEffect(() => {
    listApprovedReviews()
      .then((reviews) => {
        if (reviews.length > 0) {
          setTestimonials(reviews.map((r) => ({ id: r.id, name: r.name, quote: r.quote })));
        }
      })
      .catch(() => {
        // Si falla la carga, se mantienen los testimonios de ejemplo.
      });
  }, []);

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
          <TestimonialMarquee testimonials={testimonials} />
          <div className={styles.reviewCta}>
            <Button variant="secondary" onClick={() => setReviewFormOpen(true)}>
              Deja tu reseña
            </Button>
          </div>
        </div>
      </section>

      {reviewFormOpen && <ReviewFormModal onClose={() => setReviewFormOpen(false)} />}
    </>
  );
}
