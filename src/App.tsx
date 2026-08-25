import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Therapies from "./pages/Therapies";
import Booking from "./pages/Booking";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sobre-mi" element={<About />} />
        <Route path="/terapias" element={<Therapies />} />
        <Route path="/reservas" element={<Booking />} />
      </Route>
    </Routes>
  );
}
