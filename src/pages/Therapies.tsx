import { Button } from "../components/Button";
import { SectionHeading } from "../components/SectionHeading";
import { TherapyCard } from "../components/TherapyCard";
import { THERAPIES } from "../data/content";
import styles from "./Home.module.css";

export default function Therapies() {
  return (
    <section className={styles.section} style={{ paddingTop: 64 }}>
      <div className="container">
        <SectionHeading
          eyebrow="Terapias"
          title="Nuestras terapias holísticas"
          description="Explora las distintas modalidades y elige la que mejor acompañe tu momento actual."
          nowrap
        />
        <div className={styles.grid}>
          {THERAPIES.map((therapy) => (
            <TherapyCard key={therapy.id} therapy={therapy} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 56 }}>
          <Button to="/reservas">Reservar una sesión</Button>
        </div>
      </div>
    </section>
  );
}
