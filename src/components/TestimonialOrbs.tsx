import { useEffect, useState } from "react";
import type { Testimonial } from "../data/content";
import styles from "./TestimonialOrbs.module.css";

const MOBILE_QUERY = "(max-width: 560px)";

function usePageSize() {
  const [pageSize, setPageSize] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches ? 1 : 2
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => setPageSize(mql.matches ? 1 : 2);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return pageSize;
}

export function TestimonialOrbs({ testimonials }: { testimonials: Testimonial[] }) {
  const pageSize = usePageSize();
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(testimonials.length / pageSize);
  const visible = testimonials.slice(page * pageSize, page * pageSize + pageSize);

  useEffect(() => {
    setPage(0);
  }, [pageSize]);

  const goTo = (next: number) => setPage((next + pageCount) % pageCount);

  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        {pageCount > 1 && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonLeft}`}
            onClick={() => goTo(page - 1)}
            aria-label="Testimonios anteriores"
          >
            ←
          </button>
        )}

        <div className={styles.grid} key={page}>
          {visible.map((t, i) => (
            <div key={t.id} className={styles.orb}>
              <span
                className={styles.glow}
                aria-hidden="true"
                style={{ animationDelay: `${i * 0.9}s` }}
              />
              <span className={styles.mark} aria-hidden="true">
                “
              </span>
              <p className={styles.quote}>{t.quote}</p>
              <span className={styles.name}>{t.name}</span>
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonRight}`}
            onClick={() => goTo(page + 1)}
            aria-label="Más testimonios"
          >
            →
          </button>
        )}
      </div>

      {pageCount > 1 && (
        <div className={styles.dots}>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              className={styles.dot}
              data-active={i === page}
              onClick={() => goTo(i)}
              aria-label={`Ir a la página ${i + 1} de testimonios`}
              aria-current={i === page}
            />
          ))}
        </div>
      )}
    </div>
  );
}
