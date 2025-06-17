import Header from "../components/header";
import "./css/tarefas.css";

export default function Tarefas() {
  const diasDaSemana = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo",
  ];

  const tarefasPorDia = {
    Segunda: ["Ir na academia", "Reunião às 10h"],
    Terça: ["Estudar React", "Fazer mercado"],
    Quarta: ["Médico às 14h"],
    Quinta: ["Finalizar projeto", "Enviar relatório"],
    Sexta: ["Pagar contas", "Jogar bola"],
    Sábado: ["Lavar o carro", "Passear"],
    Domingo: ["Descansar", "Preparar a semana"],
  };

  return (
    <div>
      <Header />
      <h1 className="titulo">Minhas Tarefas</h1>

      <div className="scroll-wrapper">
        <div className="container-horizontal">
          {diasDaSemana.map((dia) => (
            <div key={dia} className="card">
              <h2>{dia}</h2>
              <ul>
                {tarefasPorDia[dia]?.map((tarefa, index) => (
                  <label className="checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    {tarefa}
                  </label>


                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
