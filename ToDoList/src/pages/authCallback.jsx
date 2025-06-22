import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotification();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      addNotification("Login realizado com sucesso!", "success");
      navigate("/tarefas");
    } else {
      addNotification("Erro ao autenticar com Google", "error");
      navigate("/");
    }
  }, [location, navigate, addNotification]);

  return <p>Autenticando...</p>;
}
