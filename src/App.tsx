import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Team from "./pages/Team";
import Therapies from "./pages/Therapies";
import FAQ from "./pages/FAQ";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import PatientsList from "./pages/admin/PatientsList";
import PatientForm from "./pages/admin/PatientForm";
import PatientDetail from "./pages/admin/PatientDetail";
import ManualBooking from "./pages/admin/ManualBooking";
import ReviewsQueue from "./pages/admin/ReviewsQueue";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/terapeutas" element={<Team />} />
          <Route path="/terapias" element={<Therapies />} />
          <Route path="/preguntas-frecuentes" element={<FAQ />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<PatientsList />} />
          <Route path="pacientes/nuevo" element={<PatientForm />} />
          <Route path="pacientes/:id" element={<PatientDetail />} />
          <Route path="reservar" element={<ManualBooking />} />
          <Route path="resenas" element={<ReviewsQueue />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
