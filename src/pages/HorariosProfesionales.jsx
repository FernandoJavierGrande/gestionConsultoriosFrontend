import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle, User } from "lucide-react";

//  const API_URL = "https://gestion-clinica-back.onrender.com/api";
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
      const response = await fetch(`${API_URL}/consultorios`);
      const data = await response.json();
      setConsultorios(data);
    } catch (error) {
      console.error("Error al cargar consultorios:", error);
    }
  };

  const fetchHorariosOcupados = async () => {
    if (!selectedConsultorio || !selectedDiaSemana) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/horarios?consultorioId=${selectedConsultorio}&diaSemana=${selectedDiaSemana}`
      );
      const data = await response.json();
      setHorariosOcupados(data);
    } catch (error) {
      console.error("Error al cargar horarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConsultorio && selectedDiaSemana) {
      fetchHorariosOcupados();
    } else {
      setHorariosOcupados([]);
    }
  }, [selectedProfesional, selectedDiaSemana, selectedConsultorio]);

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  };

  const toMinutos = (horaStr) => {
    const [h, m] = horaStr.split(":").map(Number);
    return h * 60 + m;
  };

  const seSolapan = (inicioA, durA, inicioB, durB) => {
    return inicioA < (inicioB + durB) && inicioB < (inicioA + durA);
  };

  const getEstadoSlot = (horaStr) => {
    const duracionSlot = selectedProfesional?.duracionTurno || 15;
    const inicioSlot = toMinutos(horaStr);
    const horario = horariosOcupados.find(h =>
      seSolapan(inicioSlot, duracionSlot, toMinutos(h.horaInicio), h.duracionTurno)
    );
    if (!horario) return { ocupado: false, propio: false, horarioId: null, profesionalNombre: null };
    const esPropio = selectedProfesional && horario.profesionalId === selectedProfesional.id;
    return { ocupado: true, propio: esPropio, horarioId: horario.id, profesionalNombre: horario.profesionalNombre };
  };

  const generateHorarios = () => {
    if (!selectedProfesional && horariosOcupados.length === 0) return [];
    const duracionMinutos = selectedProfesional?.duracionTurno || 15;
    const horarios = [];

    const generarBloque = (inicio, fin, periodo) => {
      let current = inicio;
      while (current < fin) {
        const horas = Math.floor(current / 60);
        const minutos = current % 60;
        const horaStr = `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
        const estado = getEstadoSlot(horaStr);
        horarios.push({ hora: horaStr, periodo, ...estado });
        current += duracionMinutos;
      }
    };

    generarBloque(8 * 60, 13 * 60, "Mañana");
    generarBloque(13 * 60, 20 * 60, "Tarde");
    return horarios;
  };

  const handleHorarioClick = (horario) => {
    if (!selectedProfesional) {
      showNotification("Seleccioná un profesional primero", "error");
      return;
    }
    if (horario.ocupado && !horario.propio) {
      showNotification(`Ocupado por ${horario.profesionalNombre}`, "error");
      return;
    }
    setSelectedHorario(horario);
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      const response = await fetch(`${API_URL}/horarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profesionalId: selectedProfesional.id,
          consultorioId: parseInt(selectedConsultorio),
          diaSemana: parseInt(selectedDiaSemana),
          horaInicio: selectedHorario.hora,
          duracionTurno: selectedProfesional.duracionTurno || 15
        })
      });
      if (response.ok) {
        showNotification("Horario agendado correctamente", "success");
      } else {
        const errorData = await response.json().catch(() => null);
        showNotification(errorData?.message || "Error al agendar el horario", "error");
      }
    } catch (error) {
      showNotification("Error al agendar el horario", "error");
    } finally {
      setShowConfirmModal(false);
      fetchHorariosOcupados();
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/horarios/${selectedHorario.horarioId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        showNotification("Horario eliminado correctamente", "success");
      } else {
        showNotification("Error al eliminar el horario", "error");
      }
    } catch (error) {
      showNotification("Error al eliminar el horario", "error");
    } finally {
      setShowConfirmModal(false);
      fetchHorariosOcupados();
    }
  };

  const horarios = generateHorarios();
  const horariosMañana = horarios.filter(h => h.periodo === "Mañana");
  const horariosTarde = horarios.filter(h => h.periodo === "Tarde");

  const renderSlot = (horario) => {
    let claseBase = "p-4 rounded-lg border-2 transition-all duration-200 ";
    let icono, textoEstado;

    if (horario.ocupado && !horario.propio) {
      claseBase += "bg-red-300 border-red-600 cursor-not-allowed opacity-70";
      icono = <User className="text-black-500 mb-2" size={24} />;
      textoEstado = <span className="text-xs text-black-500 mt-1 text-center leading-tight">{horario.profesionalNombre}</span>;
    } else if (horario.propio) {
      claseBase += "bg-green-100 border-green-500 hover:bg-green-200 cursor-pointer";
      icono = <CheckCircle className="text-green-700 mb-2" size={24} />;
      textoEstado = <span className="text-xs font-medium text-green-700 mt-1">Agendado</span>;
    } else {
      claseBase += "bg-white border-gray-200 hover:bg-green-50 hover:border-green-300 hover:shadow-md cursor-pointer";
      icono = <CheckCircle className="text-gray-300 mb-2" size={24} />;
      textoEstado = <span className="text-xs font-medium text-gray-400 mt-1">Disponible</span>;
    }

    return (
      <button
        key={horario.hora}
        onClick={() => handleHorarioClick(horario)}
        disabled={horario.ocupado && !horario.propio}
        className={claseBase}
      >
        <div className="flex flex-col items-center">
          {icono}
          <span className="font-semibold text-gray-800">{horario.hora}</span>
          {textoEstado}
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${
          notification.type === "success" ? "bg-green-500" :
          notification.type === "error" ? "bg-red-500" : "bg-blue-500"
        }`}>
          {notification.message}
        </div>
      )}

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
                <option key={dia.value} value={dia.value}>{dia.label}</option>
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
                <option key={cons.id} value={cons.id}>Consultorio {cons.numero}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline mr-2" size={18} />
              Profesional
            </label>
            <select
              value={selectedProfesional?.id || ""}
              onChange={(e) => {
                const prof = profesionales.find(p => p.id === parseInt(e.target.value));
                setSelectedProfesional(prof || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="">Seleccionar profesional</option>
              {profesionales.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.nombre} — {prof.duracionTurno || 15} min
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      {selectedConsultorio && selectedDiaSemana && (
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border-2 border-gray-200"></div>
            <span className="text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-500"></div>
            <span className="text-gray-600">Agendado (profesional seleccionado)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600 border-2 border-red-600"></div>
            <span className="text-gray-600">Ocupado por otro profesional</span>
          </div>
        </div>
      )}

      {/* Contenido */}
      {!selectedConsultorio || !selectedDiaSemana ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Clock size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Seleccioná un día y un consultorio para ver los horarios</p>
          <p className="text-gray-400 text-sm mt-1">El profesional es opcional — podés ver la ocupación del consultorio sin seleccionar uno</p>
        </div>
      ) : loading ? (
        <div className="text-center py-8">Cargando horarios...</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                {selectedProfesional ? (
                  <>
                    <h3 className="font-semibold text-gray-800">{selectedProfesional.nombre}</h3>
                    <p className="text-sm text-gray-600">Duración de turno: {selectedProfesional.duracionTurno || 15} minutos</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">Sin profesional seleccionado — vista de ocupación del consultorio</p>
                )}
                <p className="text-sm text-gray-600">
                  Consultorio: {consultorios.find(c => c.id === parseInt(selectedConsultorio))?.numero}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Día:</p>
                <p className="font-semibold text-gray-800 text-lg">
                  {diasSemana.find(d => d.value === selectedDiaSemana)?.label}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3">
              <h3 className="font-semibold text-lg">Turno Mañana (8:00 - 13:00)</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {horariosMañana.length > 0 ? horariosMañana.map(renderSlot) : (
                  <p className="col-span-6 text-center text-gray-400 py-4">Seleccioná un profesional para ver los slots</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3">
              <h3 className="font-semibold text-lg">Turno Tarde (13:00 - 20:00)</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {horariosTarde.length > 0 ? horariosTarde.map(renderSlot) : (
                  <p className="col-span-6 text-center text-gray-400 py-4">Seleccioná un profesional para ver los slots</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showConfirmModal && selectedHorario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                selectedHorario.propio ? "bg-red-100" : "bg-green-100"
              }`}>
                {selectedHorario.propio
                  ? <XCircle className="text-red-600" size={32} />
                  : <CheckCircle className="text-green-600" size={32} />}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedHorario.propio ? "¿Eliminar horario?" : "¿Agendar horario?"}
              </h2>
              <p className="text-gray-600">
                {selectedHorario.propio
                  ? "Este horario quedará disponible para otros profesionales"
                  : "Se registrará este horario para el profesional"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Profesional:</span>
                  <span className="font-semibold text-gray-800">{selectedProfesional?.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultorio:</span>
                  <span className="font-semibold text-gray-800">
                    {consultorios.find(c => c.id === parseInt(selectedConsultorio))?.numero}
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
                onClick={selectedHorario.propio ? handleConfirmDelete : handleConfirmSave}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  selectedHorario.propio ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {selectedHorario.propio ? "Eliminar" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HorariosProfesionales;