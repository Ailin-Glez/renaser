import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TherapyCard } from "../components/TherapyCard";
import { SectionHeading } from "../components/SectionHeading";
import { LocationPicker } from "../components/LocationPicker";
import {
  CANCELLATION_POLICY,
  FAMILIES,
  LOCATIONS,
  POPUP_EVENT,
  SITE,
  THERAPIES,
  type LocationKey,
} from "../data/content";
import { usePageMeta } from "../hooks/usePageMeta";
import { formatDateLong } from "../lib/dates";
import homeStyles from "./Home.module.css";
import styles from "./Therapies.module.css";

const LOCATION_STORAGE_KEY = "renaser-therapy-location";

export default function Therapies() {
  usePageMeta(
    "Terapias Holísticas",
    "Explora las terapias holísticas de RenaSER en Las Vegas y Miami: Reiki, LNT, sonoterapia y armonización de espacios."
  );

  const { hash: routeHash } = useLocation();
  const preferredFamilyKey = routeHash ? routeHash.slice(1) : null;

  const [location, setLocationState] = useState<LocationKey | null>(() => {
    const saved = sessionStorage.getItem(LOCATION_STORAGE_KEY);
    return saved === "las-vegas" || saved === "miami" ? saved : null;
  });
  const firstFamilyRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const [miamiTour, setMiamiTour] = useState<{ startDate: string; endDate: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/.netlify/functions/public-miami-tour-status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.startDate && data?.endDate) {
          setMiamiTour({ startDate: data.startDate, endDate: data.endDate });
        }
      })
      .catch(() => {
        // Silencioso — si no se puede consultar, simplemente no se muestra el aviso.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Si se llega desde "Ver terapias" de una familia en Home (con #hash),
  // esa familia se muestra primero. Si se llega desde "Reservar" del navbar
  // (sin hash), se mantiene el orden predeterminado de FAMILIES.
  const orderedFamilies = preferredFamilyKey
    ? [...FAMILIES].sort((a, b) => {
        if (a.key === preferredFamilyKey) return -1;
        if (b.key === preferredFamilyKey) return 1;
        return 0;
      })
    : FAMILIES;

  const setLocation = (value: LocationKey | null) => {
    setLocationState(value);
    if (value) {
      sessionStorage.setItem(LOCATION_STORAGE_KEY, value);
    } else {
      sessionStorage.removeItem(LOCATION_STORAGE_KEY);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (location) {
      firstFamilyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  return (
    <section className={homeStyles.section} style={{ paddingTop: 64, paddingBottom: 24 }}>
      <div className="container">
        <SectionHeading
          eyebrow="Terapias"
          title="Terapias Holísticas"
          description="Elige tu ciudad y descubre la experiencia ideal para ti."
        />

        {!location ? (
          <>
            <LocationPicker value={location} onChange={setLocation} />
            <p className={styles.emptyHint}>👆 Elige una ciudad para ver las terapias disponibles.</p>
          </>
        ) : (
          <div className={styles.locationBar}>
            <span>
              📍 Terapias en <strong>{LOCATIONS.find((l) => l.key === location)?.name}</strong>
            </span>
            <button type="button" className={styles.changeLocation} onClick={() => setLocation(null)}>
              Cambiar ciudad
            </button>
          </div>
        )}

        {location && (
          <>
            {POPUP_EVENT.active && (
              <p className={styles.dateReminder} data-visible={location === "miami"}>
                📍 Sesiones en <strong>Miami</strong> del {POPUP_EVENT.dateRange}. Reserva con antelación.
              </p>
            )}

            {miamiTour && (
              <p className={styles.dateReminder} data-visible={location === "las-vegas"}>
                ✈️ Del <strong>{formatDateLong(miamiTour.startDate)}</strong> al{" "}
                <strong>{formatDateLong(miamiTour.endDate)}</strong> estaremos de gira en Miami — esas fechas no
                tendrán citas disponibles en Las Vegas.
              </p>
            )}

            {(() => {
              let firstVisibleRendered = false;
              return orderedFamilies.map((family) => {
                const familyTherapies = THERAPIES.filter((t) => t.family === family.key && t.pricing[location]);
                if (familyTherapies.length === 0) return null;

                const isFirstVisible = !firstVisibleRendered;
                firstVisibleRendered = true;

                return (
                  <div
                    key={family.key}
                    id={family.key}
                    ref={isFirstVisible ? firstFamilyRef : undefined}
                    className={styles.familyGroup}
                  >
                    <h2 className={styles.familyTitle}>{family.name}</h2>
                    <div className={homeStyles.grid}>
                      {familyTherapies.map((therapy) => (
                        <TherapyCard key={therapy.id} therapy={therapy} location={location} />
                      ))}
                    </div>
                  </div>
                );
              });
            })()}

            <p className={styles.policyNote}>
              🔒 {CANCELLATION_POLICY.shortNote}{" "}
              <Link to="/preguntas-frecuentes#cancelacion">Ver política completa</Link>
            </p>

            <div className={styles.contactNote}>
              <span className={styles.contactIcon} aria-hidden="true">
                💬
              </span>
              <div>
                <p className={styles.contactTitle}>¿Prefieres coordinar directamente?</p>
                <p className={styles.contactLinks}>
                  <a href={`https://wa.me/${SITE.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    Escríbenos por WhatsApp
                  </a>
                  <span aria-hidden="true">·</span>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
