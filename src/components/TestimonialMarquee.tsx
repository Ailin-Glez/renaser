import type { Testimonial } from "../data/content";
import styles from "./TestimonialMarquee.module.css";

function Chip({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className={styles.chip}>
      <p className={styles.quote}>{testimonial.quote}</p>
      <span className={styles.name}>— {testimonial.name}</span>
    </div>
  );
}

export function TestimonialMarquee({ testimonials }: { testimonials: Testimonial[] }) {
  // Con pocas reseñas, el loop de la cinta se nota (la misma reseña se repite
  // enseguida). En ese caso se muestra una fila fija, sin animar ni duplicar.
  const loop = testimonials.length >= 4;
  const items = loop ? [...testimonials, ...testimonials] : testimonials;

  return (
    <div className={styles.viewport}>
      {loop && <div className={styles.fadeLeft} aria-hidden="true" />}
      {loop && <div className={styles.fadeRight} aria-hidden="true" />}
      <div className={`${styles.track} ${loop ? "" : styles.trackStatic}`}>
        {items.map((t, i) => (
          <Chip key={`${t.id}-${i}`} testimonial={t} />
        ))}
      </div>
    </div>
  );
}
