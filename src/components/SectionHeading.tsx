import { useLayoutEffect, useRef, useState } from "react";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  nowrap?: boolean;
}

// Escala el título hacia abajo (sin nunca agrandarlo) lo justo para que
// entre en una sola línea, sin importar el ancho de pantalla. Al escalar
// desde el centro de una caja centrada por flex, queda siempre centrado.
function useFitOneLine(active: boolean) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (!active) return;
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return;

    const measure = () => {
      const available = wrap.clientWidth;
      const needed = text.scrollWidth;
      setScale(needed > available ? available / needed : 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    ro.observe(text);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [active]);

  return { wrapRef, textRef, scale };
}

export function SectionHeading({ eyebrow, title, description, align = "center", nowrap = false }: SectionHeadingProps) {
  const { wrapRef, textRef, scale } = useFitOneLine(nowrap);

  return (
    <div className={styles.heading} data-align={align}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      {nowrap ? (
        <div ref={wrapRef} className={styles.fitWrap}>
          <h2 ref={textRef} className={styles.fitText} style={{ transform: `scale(${scale})` }}>
            {title}
          </h2>
        </div>
      ) : (
        <h2>{title}</h2>
      )}
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
