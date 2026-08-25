import { SectionHeading } from "../components/SectionHeading";
import { TherapyCard } from "../components/TherapyCard";
import { CAL_USERNAME, POPUP_EVENT, SITE, THERAPIES } from "../data/content";
import { CAL_NAMESPACE } from "../lib/cal";
import styles from "./Booking.module.css";

export default function Booking() {
  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeading
          eyebrow="Reservas"
          title="Agenda tu sesión"
          description="Elige la terapia que quieras reservar. Se abrirá el calendario con la disponibilidad real y recibirás confirmación al instante."
        />

        {POPUP_EVENT.active && (
          <div className={styles.popupNote}>
            <span>
              📍 Sesiones en <strong>{POPUP_EVENT.city}</strong>: {POPUP_EVENT.dateRange}. {POPUP_EVENT.note}
            </span>
            <button
              type="button"
              className={styles.popupButton}
              data-cal-namespace={CAL_NAMESPACE}
              data-cal-link={`${CAL_USERNAME}/${POPUP_EVENT.calSlug}`}
              data-cal-config={'{"layout":"month_view"}'}
            >
              Reservar en {POPUP_EVENT.city}
            </button>
          </div>
        )}

        <div className={styles.grid}>
          {THERAPIES.map((therapy) => (
            <TherapyCard key={therapy.id} therapy={therapy} />
          ))}
        </div>

        <p className={styles.note}>
          ¿Prefieres coordinar directamente? Escríbenos a {SITE.email} o al {SITE.phone}.
        </p>
      </div>
    </section>
  );
}
