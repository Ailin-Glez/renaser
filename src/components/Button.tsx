import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Button.module.css";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  to?: string;
  href?: string;
}

export function Button({ children, variant = "primary", to, href }: ButtonProps) {
  const className = `${styles.button} ${styles[variant]}`;

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return <button className={className}>{children}</button>;
}
