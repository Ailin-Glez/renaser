import type { CSSProperties } from "react";
import styles from "./Leaves.module.css";

const COLORS = ["green", "forest", "gold"] as const;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const LEAVES = Array.from({ length: 11 }, (_, i) => {
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

export function Leaves() {
  return (
    <div className={styles.field} aria-hidden="true">
      {LEAVES.map((l, i) => (
        <span
          key={i}
          className={`${styles.leaf} ${styles[l.color]}`}
          style={
            {
              left: l.left,
              width: l.size,
              height: l.size * 1.5,
              animationDuration: `${l.duration}s`,
              animationDelay: `${l.delay}s`,
              "--drift": `${l.drift}px`,
              "--rotate-start": `${l.rotateStart}deg`,
              "--spin": `${l.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
