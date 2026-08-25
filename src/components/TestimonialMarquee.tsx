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
  return (
    <div className={styles.viewport}>
      <div className={styles.fadeLeft} aria-hidden="true" />
      <div className={styles.fadeRight} aria-hidden="true" />
      <div className={styles.track}>
        {[...testimonials, ...testimonials].map((t, i) => (
          <Chip key={`${t.id}-${i}`} testimonial={t} />
        ))}
      </div>
    </div>
  );
}
