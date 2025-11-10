import { Link, useLocation } from "react-router-dom";
import { Home, Users, Stethoscope, Calendar, BriefcaseMedical, Hospital, LogOut } from "lucide-react";

function Navbar({ onLogout }) {
  const location = useLocation();
  const links = [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/pacientes", label: "Pacientes", icon: Users },
    { to: "/medicos", label: "Médicos", icon: Hospital },
    { to: "/turnos", label: "Turnos", icon: Calendar },
    { to: "/especialidades", label: "Especialidades", icon: BriefcaseMedical },
    { to: "/horariosProfesionales", label: "Horarios", icon: BriefcaseMedical },
    
  ];

  return (
    <nav className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="mx-auto px-4 w-full">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Título */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Stethoscope className="text-blue-600" size={24} />
            </div>
            <span className="text-xl font-bold">Sistema de gestión de Consultorios</span>
          </div>

          {/* Links de navegación */}
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white text-blue-600 font-semibold shadow-md"
                      : "hover:bg-blue-500 hover:bg-opacity-50"
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Botón Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 ml-2 rounded-lg transition-all duration-200 hover:bg-red-500 hover:bg-opacity-50 border-l border-blue-500 pl-4"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;