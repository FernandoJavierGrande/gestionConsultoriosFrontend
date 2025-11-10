import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

// const API_URL = `${import.meta.env.VITE_API_URL}/api`;
const API_URL = "http://localhost:8080/api";

function HorariosProfesionales() {
  const [profesionales, setProfesionales] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [selectedDiaSemana, setSelectedDiaSemana] = useState("");
  const [selectedProfesional, setSelectedProfesional] = useState(null);
  const [selectedConsultorio, setSelectedConsultorio] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const diasSemana = [
    { value: "1", label: "Lunes" },
    { value: "2", label: "Martes" },
    { value: "3", label: "Miércoles" },
    { value: "4", label: "Jueves" },
    { value: "5", label: "Viernes" },
    { value: "6", label: "Sábado" }
  ];

  useEffect(() => {
    fetchProfesionales();
    fetchConsultorios();
  }, []);

  const fetchProfesionales = async () => {
    try {
      const response = await fetch(`${API_URL}/profesional`);
      const data = await response.json();
      setProfesionales(data);
    } catch (error) {
      console.error("Error al cargar profesionales:", error);
    }
  };

  const fetchConsultorios = async () => {
    try {
      // Simulación - reemplazar con API real
      // GET /api/consultorios
      const mockConsultorios = [
        { id: 1, nombre: "Consultorio 1" },
        { id: 2, nombre: "Consultorio 2" },
        { id: 3, nombre: "Consultorio 3" }
      ];
      setConsultorios(mockConsultorios);
    } catch (error) {
      console.error("Error al cargar consultorios:", error);
    }
  };

  const fetchHorariosOcupados = async () => {
    if (!selectedProfesional || !selectedDiaSemana || !selectedConsultorio) return;

    setLoading(true);
    try {
      // GET /api/horarios?profesional_id={id}&dia_semana={1-6}&consultorio_id={consultorio}
      const mockOcupados = [
        { 
          horaInicio: "09:00", 
          duracionMinutos: 30,
          paciente: "Juan Pérez" 
        },
        { 
          horaInicio: "10:00", 
          duracionMinutos: 30,
          paciente: "María González" 
        },
        { 
          horaInicio: "14:30", 
          duracionMinutos: 15,
          paciente: "Carlos López" 
        }
      ];
      
      setHorariosOcupados(mockOcupados);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar horarios ocupados:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProfesional && selectedDiaSemana && selectedConsultorio) {
      fetchHorariosOcupados();
    }
  }, [selectedProfesional, selectedDiaSemana, selectedConsultorio]);

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  const isHorarioOcupado = (horaStr) => {
    // Convierte la hora string a minutos totales
    const [horas, minutos] = horaStr.split(':').map(Number);
    const horaEnMinutos = horas * 60 + minutos;
    
    // Verifica si este horario cae dentro de algún turno ocupado
    for (const ocupado of horariosOcupados) {
      const [inicioHoras, inicioMinutos] = ocupado.horaInicio.split(':').map(Number);
      const inicioEnMinutos = inicioHoras * 60 + inicioMinutos;
      const finEnMinutos = inicioEnMinutos + ocupado.duracionMinutos;
      
      // Si el horario actual está dentro del rango ocupado
      if (horaEnMinutos >= inicioEnMinutos && horaEnMinutos < finEnMinutos) {
        return { ocupado: true, paciente: ocupado.paciente };
      }
    }
    
    return { ocupado: false, paciente: null };
  };

  const generateHorarios = () => {
    if (!selectedProfesional) return [];

    const duracionMinutos = selectedProfesional.duracion?.duracion || 15;
    const horarios = [];
    
    // Horario de mañana: 8:00 - 13:00
    let currentTime = 8 * 60;
    const endMorning = 13 * 60;
    
    while (currentTime < endMorning) {
      const horas = Math.floor(currentTime / 60);
      const minutos = currentTime % 60;
      const horaStr = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
      
      const { ocupado, paciente } = isHorarioOcupado(horaStr);
      
      horarios.push({
        hora: horaStr,
        ocupado,
        paciente,
        periodo: 'Mañana'
      });
      
      currentTime += duracionMinutos;
    }
    
    // Horario de tarde: 14:00 - 20:00
    currentTime = 14 * 60;
    const endAfternoon = 20 * 60;
    
    while (currentTime < endAfternoon) {
      const horas = Math.floor(currentTime / 60);
      const minutos = currentTime % 60;
      const horaStr = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
      
      const { ocupado, paciente } = isHorarioOcupado(horaStr);
      
      horarios.push({
        hora: horaStr,
        ocupado,
        paciente,
        periodo: 'Tarde'
      });
      
      currentTime += duracionMinutos;
    }
    
    return horarios;
  };

  const handleHorarioClick = (horario) => {
    if (horario.ocupado) {
      showNotification("Este horario ya está ocupado", "error");
      return;
    }
    
    setSelectedHorario(horario);
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      // Aquí irá la llamada a la API para guardar el horario
      console.log("Guardando horario:", {
        profesional_id: selectedProfesional.id,
        consultorio_id: selectedConsultorio,
        dia_semana: selectedDiaSemana,
        hora: selectedHorario.hora
      });
      
      showNotification("Horario guardado correctamente", "success");
      setShowConfirmModal(false);
      fetchHorariosOcupados(); // Recargar horarios
    } catch (error) {
      console.error("Error:", error);
      showNotification("Error al guardar el horario", "error");
    }
  };

  const horarios = generateHorarios();
  const horariosMañana = horarios.filter(h => h.periodo === 'Mañana');
  const horariosTarde = horarios.filter(h => h.periodo === 'Tarde');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Notificación */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${
          notification.type === "success" ? "bg-green-500" : 
          notification.type === "error" ? "bg-red-500" : "bg-blue-500"
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Horarios</h1>
        <p className="text-gray-600 mt-1">Administra la disponibilidad horaria de los profesionales</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-2" size={18} />
              Día de la Semana
            </label>
            <select
              value={selectedDiaSemana}
              onChange={(e) => setSelectedDiaSemana(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="">Seleccionar día</option>
              {diasSemana.map((dia) => (
                <option key={dia.value} value={dia.value}>
                  {dia.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline mr-2" size={18} />
              Consultorio
            </label>
            <select
              value={selectedConsultorio}
              onChange={(e) => setSelectedConsultorio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="">Seleccionar consultorio</option>
              {consultorios.map((cons) => (
                <option key={cons.id} value={cons.id}>
                  {cons.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline mr-2" size={18} />
              Profesional
            </label>
            <select
              value={selectedProfesional?.id || ""}
              onChange={(e) => {
                const prof = profesionales.find(p => p.id === parseInt(e.target.value));
                setSelectedProfesional(prof);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="">Seleccionar profesional</option>
              {profesionales.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.nombre} - Duración: {prof.duracion?.duracion || 15} min
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {!selectedProfesional || !selectedConsultorio || !selectedDiaSemana ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Clock size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Selecciona un día, consultorio y profesional para ver los horarios disponibles</p>
        </div>
      ) : loading ? (
        <div className="text-center py-8">Cargando horarios...</div>
      ) : (
        <div className="space-y-6">
          {/* Info del profesional y consultorio */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{selectedProfesional.nombre}</h3>
                <p className="text-sm text-gray-600">
                  Duración de turno: {selectedProfesional.duracion?.duracion || 15} minutos
                </p>
                <p className="text-sm text-gray-600">
                  Consultorio: {consultorios.find(c => c.id === parseInt(selectedConsultorio))?.nombre}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Día seleccionado:</p>
                <p className="font-semibold text-gray-800 text-lg">
                  {diasSemana.find(d => d.value === selectedDiaSemana)?.label}
                </p>
              </div>
            </div>
          </div>

          {/* Horarios Mañana */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3">
              <h3 className="font-semibold text-lg">Turno Mañana (8:00 - 13:00)</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {horariosMañana.map((horario) => (
                  <button
                    key={horario.hora}
                    onClick={() => handleHorarioClick(horario)}
                    disabled={horario.ocupado}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      horario.ocupado
                        ? 'bg-red-50 border-red-300 cursor-not-allowed opacity-60'
                        : 'bg-green-50 border-green-300 hover:bg-green-100 hover:border-green-400 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      {horario.ocupado ? (
                        <XCircle className="text-red-600 mb-2" size={24} />
                      ) : (
                        <CheckCircle className="text-green-600 mb-2" size={24} />
                      )}
                      <span className="font-semibold text-gray-800">{horario.hora}</span>
                      {horario.ocupado && horario.paciente && (
                        <span className="text-xs text-gray-600 mt-1 text-center">{horario.paciente}</span>
                      )}
                      <span className={`text-xs font-medium mt-1 ${
                        horario.ocupado ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {horario.ocupado ? 'Ocupado' : 'Disponible'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Horarios Tarde */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3">
              <h3 className="font-semibold text-lg">Turno Tarde (14:00 - 20:00)</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {horariosTarde.map((horario) => (
                  <button
                    key={horario.hora}
                    onClick={() => handleHorarioClick(horario)}
                    disabled={horario.ocupado}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      horario.ocupado
                        ? 'bg-red-50 border-red-300 cursor-not-allowed opacity-60'
                        : 'bg-green-50 border-green-300 hover:bg-green-100 hover:border-green-400 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      {horario.ocupado ? (
                        <XCircle className="text-red-600 mb-2" size={24} />
                      ) : (
                        <CheckCircle className="text-green-600 mb-2" size={24} />
                      )}
                      <span className="font-semibold text-gray-800">{horario.hora}</span>
                      {horario.ocupado && horario.paciente && (
                        <span className="text-xs text-gray-600 mt-1 text-center">{horario.paciente}</span>
                      )}
                      <span className={`text-xs font-medium mt-1 ${
                        horario.ocupado ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {horario.ocupado ? 'Ocupado' : 'Disponible'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && selectedHorario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Guardar Horario?</h2>
              <p className="text-gray-600">
                Se guardará el horario disponible para el profesional
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Profesional:</span>
                  <span className="font-semibold text-gray-800">{selectedProfesional.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultorio:</span>
                  <span className="font-semibold text-gray-800">
                    {consultorios.find(c => c.id === parseInt(selectedConsultorio))?.nombre}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Día:</span>
                  <span className="font-semibold text-gray-800">
                    {diasSemana.find(d => d.value === selectedDiaSemana)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hora:</span>
                  <span className="font-semibold text-gray-800">{selectedHorario.hora}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HorariosProfesionales;