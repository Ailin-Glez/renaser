import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { initCal } from "../lib/cal";
import styles from "./Layout.module.css";

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    initCal();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

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
