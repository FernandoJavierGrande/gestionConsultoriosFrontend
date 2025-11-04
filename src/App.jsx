import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Pacientes from "./pages/Pacientes";
import Medicos from "./pages/Medicos";
import Turnos from "./pages/Turnos";
import Especialidades from "./pages/Especialidades";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/pacientes" 
            element={
              <main className="max-w-7xl mx-auto px-4 py-8">
                <Pacientes />
              </main>
            } 
          />
          <Route 
            path="/medicos" 
            element={
              <main className="max-w-7xl mx-auto px-4 py-8">
                <Medicos />
              </main>
            } 
          />
          <Route 
            path="/turnos" 
            element={
              <main className="max-w-7xl mx-auto px-4 py-8">
                <Turnos />
              </main>
            } 
          /><Route 
            path="/Especialidades" 
            element={
              <main className="max-w-7xl mx-auto px-4 py-8">
                <Especialidades />
              </main>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;