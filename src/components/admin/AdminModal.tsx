import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./AdminModal.module.css";

interface AdminModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export function AdminModal({ title, onClose, children, wide = false }: AdminModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={`${styles.modal} ${wide ? styles.wide : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <h2 className={styles.title}>{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
}
