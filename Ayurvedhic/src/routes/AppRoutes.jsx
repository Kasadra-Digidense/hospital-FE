import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import DashBoard from "../pages/DashBoard";
import Login from "../pages/Login";
import Sidebar from "../layouts/Sidebar";
import PatientRegister from "../pages/PatientRegister";
import DoctorRegister from "../pages/DoctorRegister";
import Invoice from "../pages/Invoice";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Sidebar />}>
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/patient-register" element={<PatientRegister />} />
          <Route path="/doctor-register" element={<DoctorRegister />} />
          <Route path="/invoice" element={<Invoice />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
