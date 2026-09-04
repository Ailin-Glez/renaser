import { LOCATIONS, POPUP_EVENT, type LocationKey } from "../data/content";
import styles from "./LocationPicker.module.css";

interface LocationPickerProps {
  value: LocationKey | null;
  onChange: (location: LocationKey) => void;
}

function hintFor(key: LocationKey): string {
  if (key === "miami" && POPUP_EVENT.active) {
    return POPUP_EVENT.dateRange;
  }
  return "Disponible todo el año";
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  return (
    <div className={styles.wrap}>
      <p className={styles.prompt}>
        <span className={styles.step}>1</span>
        ¿Dónde quieres tu sesión?
      </p>
      <div className={styles.options}>
        {LOCATIONS.map((location) => (
          <button
            key={location.key}
            type="button"
            className={`${styles.option} ${value === location.key ? styles.optionSelected : ""}`}
            onClick={() => onChange(location.key)}
          >
            <span className={styles.cityName}>{location.name}</span>
            <span className={styles.cityHint}>{hintFor(location.key)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
