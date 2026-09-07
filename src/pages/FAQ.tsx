import { useLocation } from "react-router-dom";
import { AskQuestion } from "../components/AskQuestion";
import { FAQAccordion } from "../components/FAQAccordion";
import { SectionHeading } from "../components/SectionHeading";
import { FAQ as FAQ_ITEMS } from "../data/content";
import { usePageMeta } from "../hooks/usePageMeta";
import homeStyles from "./Home.module.css";
import styles from "./FAQ.module.css";

export default function FAQPage() {
  usePageMeta(
    "Preguntas Frecuentes",
    "Resuelve tus dudas sobre las terapias holísticas de RenaSER: preparación, frecuencia, embarazo y más."
  );

  const { hash } = useLocation();
  const openId = hash ? hash.slice(1) : undefined;

  return (
    <section className={homeStyles.section} style={{ paddingTop: 64 }}>
      <div className="container">
        <SectionHeading
          eyebrow="Ayuda"
          title="Preguntas Frecuentes"
          description="Todo lo que necesitas saber antes de reservar tu experiencia."
        />
        <div className={styles.wrap}>
          <FAQAccordion items={FAQ_ITEMS} openId={openId} />
          <AskQuestion />
        </div>
      </div>
    </section>
  );
}
