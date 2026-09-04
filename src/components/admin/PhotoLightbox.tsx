import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./PhotoLightbox.module.css";

interface PhotoLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function PhotoLightbox({ src, alt, onClose }: PhotoLightboxProps) {
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
      <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
        ×
      </button>
      <img src={src} alt={alt} className={styles.image} onClick={(e) => e.stopPropagation()} />
    </div>,
    document.body
  );
}
