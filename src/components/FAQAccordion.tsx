import { useState } from "react";
import type { FAQItem } from "../data/content";
import styles from "./FAQAccordion.module.css";

function AccordionItem({ item, initiallyOpen }: { item: FAQItem; initiallyOpen: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <div id={item.id} className={styles.item}>
      <button
        type="button"
        className={styles.question}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {item.question}
        <span className={`${styles.icon} ${open ? styles.iconOpen : ""}`} aria-hidden="true">
          +
        </span>
      </button>
      <div className={styles.answerWrap} data-open={open}>
        <div className={styles.answer}>
          <div className={styles.answerInner}>
            {item.answer.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQAccordion({ items, openId }: { items: FAQItem[]; openId?: string }) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <AccordionItem key={item.id} item={item} initiallyOpen={item.id === openId} />
      ))}
    </div>
  );
}
