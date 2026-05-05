import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import DashBoard from "../pages/DashBoard";
import Login from "../pages/Login";
import Sidebar from "../layouts/Sidebar";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Sidebar />}>
        <Route path="/dashboard" element={<DashBoard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
