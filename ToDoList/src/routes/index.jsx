import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login.jsx";
import Tarefas from "../pages/tarefas.jsx";
import Dashboard from "../pages/dashboard";
import EsqueciSenha from "../pages/esqueci-senha.jsx";
import CodigoRecuperacao from "../pages/codigo-recuperacao.jsx";
import NovaSenha from "../pages/nova-senha.jsx";
import Cadastro from "../pages/cadastro.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tarefas" element={<Tarefas />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/codigo-recuperacao" element={<CodigoRecuperacao />} />
        <Route path="/nova-senha" element={<NovaSenha />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}
