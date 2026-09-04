import { FAQAccordion } from "../components/FAQAccordion";
import { SectionHeading } from "../components/SectionHeading";
import { FAQ as FAQ_ITEMS } from "../data/content";
import homeStyles from "./Home.module.css";
import styles from "./FAQ.module.css";

export default function FAQPage() {
  return (
    <section className={homeStyles.section} style={{ paddingTop: 64 }}>
      <div className="container">
        <SectionHeading
          eyebrow="Ayuda"
          title="Preguntas Frecuentes"
          description="Todo lo que necesitas saber antes de reservar tu experiencia."
        />
        <div className={styles.wrap}>
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
