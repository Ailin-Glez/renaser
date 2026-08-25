import type { CSSProperties } from "react";
import styles from "./Leaves.module.css";

const COLORS = ["green", "forest", "gold"] as const;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const DESKTOP_LEAVES = Array.from({ length: 11 }, (_, i) => {
  const onLeftSide = i % 2 === 0;
  const left = onLeftSide ? randomBetween(1, 16) : randomBetween(84, 99);
  // Deriva hacia afuera del centro, para que nunca crucen sobre el texto.
  const drift = onLeftSide ? randomBetween(-30, 10) : randomBetween(-10, 30);
  const duration = randomBetween(16, 28);

  return {
    left: `${left.toFixed(1)}%`,
    size: randomBetween(16, 30),
    duration,
    // Delay negativo: arrancan ya "en vuelo" al cargar, en vez de esperar antes de aparecer.
    delay: -randomBetween(0, duration),
    drift,
    rotateStart: randomBetween(0, 360),
    spin: randomBetween(220, 420) * (Math.random() > 0.5 ? 1 : -1),
    color: COLORS[i % COLORS.length],
  };
});

// En móvil las hojas caen desde arriba, más hacia los lados que al centro,
// y se desvanecen antes de llegar al logo para no interferir con el texto.
const MOBILE_LEAVES = Array.from({ length: 6 }, (_, i) => {
  const onLeftSide = i % 2 === 0;
  const left = onLeftSide ? randomBetween(6, 26) : randomBetween(74, 94);
  const duration = randomBetween(12, 19);

  return {
    left: `${left.toFixed(1)}%`,
    size: randomBetween(8, 14),
    duration,
    delay: -randomBetween(0, duration),
    drift: randomBetween(-14, 14),
    rotateStart: randomBetween(0, 360),
    spin: randomBetween(160, 280) * (Math.random() > 0.5 ? 1 : -1),
    color: COLORS[i % COLORS.length],
  };
});

function leafStyle(l: (typeof DESKTOP_LEAVES)[number]) {
  return {
    left: l.left,
    width: l.size,
    height: l.size * 1.5,
    animationDuration: `${l.duration}s`,
    animationDelay: `${l.delay}s`,
    "--drift": `${l.drift}px`,
    "--rotate-start": `${l.rotateStart}deg`,
    "--spin": `${l.spin}deg`,
  } as CSSProperties;
}

export function Leaves() {
  return (
    <>
      <div className={`${styles.field} ${styles.fieldDesktop}`} aria-hidden="true">
        {DESKTOP_LEAVES.map((l, i) => (
          <span key={i} className={`${styles.leaf} ${styles[l.color]}`} style={leafStyle(l)} />
        ))}
      </div>
      <div className={`${styles.field} ${styles.fieldMobile}`} aria-hidden="true">
        {MOBILE_LEAVES.map((l, i) => (
          <span key={i} className={`${styles.leafMobile} ${styles[l.color]}`} style={leafStyle(l)} />
        ))}
      </div>
    </>
  );
}
