import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import PatientsList from "./PatientsList";
import PatientForm from "./PatientForm";
import PatientDetail from "./PatientDetail";
import ManualBooking from "./ManualBooking";
import ReviewsQueue from "./ReviewsQueue";
import MiamiTour from "./MiamiTour";

// Todo lo de Admin (incluido Firebase Auth) vive en este único punto de
// entrada, para que App.tsx pueda cargarlo entero con un solo import()
// perezoso y así no llegue al bundle del sitio público.
export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route index element={<PatientsList />} />
          <Route path="pacientes/nuevo" element={<PatientForm />} />
          <Route path="pacientes/:id" element={<PatientDetail />} />
          <Route path="reservar" element={<ManualBooking />} />
          <Route path="resenas" element={<ReviewsQueue />} />
          <Route path="gira-miami" element={<MiamiTour />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
