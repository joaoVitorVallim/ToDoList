import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Tarefas from "../pages/tarefas";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/tarefas" element={<Tarefas />} />
      </Routes>
    </BrowserRouter>
  );
}
