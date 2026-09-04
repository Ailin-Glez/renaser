import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Team from "./pages/Team";
import Therapies from "./pages/Therapies";
import FAQ from "./pages/FAQ";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/terapeutas" element={<Team />} />
        <Route path="/terapias" element={<Therapies />} />
        <Route path="/preguntas-frecuentes" element={<FAQ />} />
      </Route>
    </Routes>
  );
}
