import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Pacientes from "./pages/Pacientes";
import Medicos from "./pages/Medicos";
import Turnos from "./pages/Turnos";
import Especialidades from "./pages/Especialidades";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import HorariosProfesionales from "./pages/HorariosProfesionales";
import Usuarios from "./pages/Usuarios";

function App() {
  const [usuarioActual, setUsuarioActual] = useState(null);

  const handleLogin = (usuario) => {
    setUsuarioActual(usuario); // { id, user, permisos }
  };

  const handleLogout = () => {
    setUsuarioActual(null);
  };

  if (!usuarioActual) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogout={handleLogout} usuarioActual={usuarioActual} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pacientes" element={
            <main className="max-w-7xl mx-auto px-4 py-8"><Pacientes /></main>
          } />
          <Route path="/medicos" element={
            <main className="max-w-7xl mx-auto px-4 py-8"><Medicos /></main>
          } />
          <Route path="/turnos" element={
            <main className="max-w-7xl mx-auto px-4 py-8"><Turnos /></main>
          } />
          <Route path="/Especialidades" element={
            <main className="max-w-7xl mx-auto px-4 py-8"><Especialidades /></main>
          } />
          <Route path="/horariosProfesionales" element={<HorariosProfesionales />} />
          {/* Solo admin puede ver usuarios */}
          {usuarioActual.permisos === "admin" && (
            <Route path="/usuarios" element={
              <main className="max-w-7xl mx-auto px-4 py-8">
                <Usuarios usuarioActual={usuarioActual} />
              </main>
            } />
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
