import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Tarefas from "../pages/tarefas";
import Dashboard from "../pages/dashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tarefas" element={<Tarefas />} />
      </Routes>
    </BrowserRouter>
  );
}
