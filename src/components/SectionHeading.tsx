import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  nowrap?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  nowrap = false,
}: SectionHeadingProps) {
  return (
    <div className={styles.heading} data-align={align} data-nowrap={nowrap}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
