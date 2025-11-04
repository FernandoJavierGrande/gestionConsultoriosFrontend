import { Users, Stethoscope, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  const cards = [
    {
      title: "Pacientes",
      description: "Gestiona la información de los pacientes",
      icon: Users,
      link: "/pacientes",
      color: "blue"
    },
    {
      title: "Médicos",
      description: "Administra el personal médico",
      icon: Stethoscope,
      link: "/medicos",
      color: "green"
    },
    {
      title: "Turnos",
      description: "Agenda y consulta turnos médicos",
      icon: Calendar,
      link: "/turnos",
      color: "purple"
    }
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-600",
    green: "bg-green-100 text-green-600 group-hover:bg-green-600",
    purple: "bg-purple-100 text-purple-600 group-hover:bg-purple-600"
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Sistema de Turnos Médicos
        </h1>
        <p className="text-xl text-gray-600">
          Bienvenido al sistema de gestión de turnos de la clínica. 
          Seleccioná una opción para comenzar.
        </p>
      </div>

      {/* Cards - con contenedor limitado */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.link}
                to={card.link}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-6 transition-all duration-300 ${colorClasses[card.color]} group-hover:text-white`}>
                  <Icon size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  {card.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {card.description}
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Ir a {card.title}
                  <ArrowRight size={20} className="ml-2" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Stats o información adicional */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                Quick
              </div>
              <div className="text-gray-600">Gestión Ágil</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                Simple
              </div>
              <div className="text-gray-600">Interfaz Intuitiva</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                Eficaz
              </div>
              <div className="text-gray-600">Resultados Rápidos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;