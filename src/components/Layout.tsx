import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { initCal } from "../lib/cal";
import styles from "./Layout.module.css";

export function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    initCal();
  }, []);

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
        });
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return (
    <div className={styles.page}>
      <Header />
      <main key={pathname} className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
