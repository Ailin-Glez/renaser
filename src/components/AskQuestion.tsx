import { useState } from "react";
import { SITE } from "../data/content";
import styles from "./AskQuestion.module.css";

const DEFAULT_MESSAGE = "Hola, tengo una pregunta sobre las terapias de Renaser:";

export function AskQuestion() {
  const [question, setQuestion] = useState("");

  const message = question.trim() ? `${DEFAULT_MESSAGE}\n\n${question.trim()}` : DEFAULT_MESSAGE;
  const whatsappDigits = SITE.phone.replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>¿Tienes otra pregunta?</h3>
      <p className={styles.subtitle}>Escríbenos por WhatsApp y te respondemos lo antes posible.</p>

      <textarea
        className={styles.textarea}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Escribe tu pregunta aquí (opcional)…"
        rows={3}
      />

      <div className={styles.actions}>
        <a href={whatsappHref} target="_blank" rel="noreferrer" className={styles.whatsappButton}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a7.9 7.9 0 0 1-2.3-1.4 8.6 8.6 0 0 1-1.6-2c-.2-.3 0-.4.1-.6l.4-.5.2-.4a.5.5 0 0 0 0-.4c-.1-.1-.7-1.6-.9-2.2s-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.4 5.9 5.9 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c.7.3 1.3.5 1.7.6a4.1 4.1 0 0 0 1.9.1 3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.1-.3-.2-.6-.3Z" />
            <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
          </svg>
          WhatsApp
        </a>
      </div>
    </div>
  );
}
