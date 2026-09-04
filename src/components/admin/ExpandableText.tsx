import { useState } from "react";
import styles from "./ExpandableText.module.css";

const COLLAPSE_THRESHOLD = 220;

export function ExpandableText({ text, lines = 3 }: { text: string; lines?: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > COLLAPSE_THRESHOLD;

  return (
    <div>
      <p
        className={`${styles.text} ${!expanded && isLong ? styles.clamped : ""}`}
        style={!expanded && isLong ? { WebkitLineClamp: lines } : undefined}
      >
        {text}
      </p>
      {isLong && (
        <button type="button" className={styles.toggle} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Ver menos" : "Ver más"}
        </button>
      )}
    </div>
  );
}
