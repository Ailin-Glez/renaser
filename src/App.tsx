import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Team from "./pages/Team";
import Therapies from "./pages/Therapies";
import FAQ from "./pages/FAQ";

// Todo el panel de Admin (rutas, Firebase Auth, Firestore admin) se carga
// en un solo chunk aparte, solo cuando alguien entra a /admin/* — así los
// visitantes del sitio público no lo descargan.
const AdminApp = lazy(() => import("./pages/admin/AdminApp"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/terapeutas" element={<Team />} />
        <Route path="/terapias" element={<Therapies />} />
        <Route path="/preguntas-frecuentes" element={<FAQ />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div style={{ padding: 40 }}>Cargando…</div>}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  );
}
