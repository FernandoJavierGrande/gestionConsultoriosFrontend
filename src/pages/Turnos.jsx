import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, User, X, Search, Printer } from "lucide-react";

const API_URL = "https://gestion-clinica-back.onrender.com/api";
//const API_URL = "http://localhost:8080/api";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function getLunes(fecha) {
  const d = new Date(fecha);
  const dia = d.getDay(); // 0=dom, 1=lun...
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatFecha(date) {
  return date.toISOString().split("T")[0];
}

function formatDisplay(date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function Turnos() {
  const [especialidades, setEspecialidades] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalesFiltrados, setProfesionalesFiltrados] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  const [selectedEspecialidad, setSelectedEspecialidad] = useState("");
  const [selectedProfesional, setSelectedProfesional] = useState(null);

  const [semanaBase, setSemanaBase] = useState(() => getLunes(new Date()));
  const [slots, setSlots] = useState([]);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalSlot, setModalSlot] = useState(null);
  const [searchPaciente, setSearchPaciente] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  useEffect(() => {
    fetchEspecialidades();
    fetchProfesionales();
    fetchPacientes();
  }, []);

  const fetchEspecialidades = async () => {
    try {
      const res = await fetch(`${API_URL}/especialidad`);
      setEspecialidades(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchProfesionales = async () => {
    try {
      const res = await fetch(`${API_URL}/profesional`);
      const data = await res.json();
      setProfesionales(data);
      setProfesionalesFiltrados(data);
    } catch (e) { console.error(e); }
  };

  const fetchPacientes = async () => {
    try {
      const res = await fetch(`${API_URL}/paciente`);
      setPacientes(await res.json());
    } catch (e) { console.error(e); }
  };

  // filtra profesionales por especialidad
  useEffect(() => {
    if (!selectedEspecialidad) {
      setProfesionalesFiltrados(profesionales);
    } else {
      const filtrados = profesionales.filter(p =>
        Array.isArray(p.matriculas) &&
        p.matriculas.some(m => m.especialidad?.id === parseInt(selectedEspecialidad))
      );
      setProfesionalesFiltrados(filtrados);
    }
    setSelectedProfesional(null);
    setSlots([]);
  }, [selectedEspecialidad, profesionales]);

  //cargasemana cuando cambia profesional o semana
  useEffect(() => {
    if (!selectedProfesional) { setSlots([]); return; }
    fetchSemana();
  }, [selectedProfesional, semanaBase]);

  const fetchSemana = async () => {
    setLoading(true);
    const lunes = semanaBase;
    const sabado = new Date(lunes);
    sabado.setDate(sabado.getDate() + 5);

    try {
      const res = await fetch(
        `${API_URL}/turnos/semana?profesionalId=${selectedProfesional.id}&fechaInicio=${formatFecha(lunes)}&fechaFin=${formatFecha(sabado)}`
      );
      const data = await res.json();
      setSlots(data);
    } catch (e) {
      console.error(e);
      showNotification("Error al cargar la semana", "error");
    } finally {
      setLoading(false);
    }
  };

  const semanaAnterior = () => {
    const d = new Date(semanaBase);
    d.setDate(d.getDate() - 7);
    setSemanaBase(d);
  };

  const semanaSiguiente = () => {
    const d = new Date(semanaBase);
    d.setDate(d.getDate() + 7);
    setSemanaBase(d);
  };

  // devuelve la fecha de cada día de la semana actual
  const diasSemana = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(semanaBase);
    d.setDate(d.getDate() + i);
    return d;
  });

  // agrupa por dia
  const slotsPorDia = (fecha) => {
    const fechaStr = formatFecha(fecha);
    return slots
      .filter(s => s.fecha === fechaStr)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  };

  const handleSlotClick = (slot) => {
    setModalSlot(slot);
    setSearchPaciente("");
    setPacienteSeleccionado(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalSlot(null);
    setSearchPaciente("");
    setPacienteSeleccionado(null);
  };

  const pacientesFiltrados = pacientes.filter(p => {
    const term = searchPaciente.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(term) ||
      p.apellido.toLowerCase().includes(term) ||
      p.CUIL.includes(term)
    );
  });

  const handleGuardarTurno = async () => {
    if (!pacienteSeleccionado) {
      showNotification("Seleccioná un paciente", "error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/turnos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profesionalId: selectedProfesional.id,
          consultorioId: modalSlot.consultorioId,
          pacienteId: pacienteSeleccionado.id,
          hora: `${modalSlot.fecha}T${modalSlot.horaInicio}:00`
        })
      });

      if (res.ok) {
        showNotification("Turno asignado correctamente", "success");
        closeModal();
        fetchSemana();
      } else {
        const err = await res.json().catch(() => null);
        showNotification(err?.message || "Error al guardar el turno", "error");
      }
    } catch (e) {
      showNotification("Error al guardar el turno", "error");
    }
  };

  const handleReasignar = async () => {
    if (!pacienteSeleccionado) {
      showNotification("Seleccioná un paciente", "error");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/turnos/${modalSlot.turnoId}/reasignar?pacienteId=${pacienteSeleccionado.id}`,
        { method: "PUT" }
      );

      if (res.ok) {
        showNotification("Turno reasignado correctamente", "success");
        closeModal();
        fetchSemana();
      } else {
        const err = await res.json().catch(() => null);
        showNotification(err?.message || "Error al reasignar", "error");
      }
    } catch (e) {
      showNotification("Error al reasignar el turno", "error");
    }
  };

  const handleCancelar = async () => {
    if (!confirm("¿Cancelar este turno?")) return;
    try {
      const res = await fetch(`${API_URL}/turnos/${modalSlot.turnoId}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Turno cancelado", "success");
        closeModal();
        fetchSemana();
      } else {
        showNotification("Error al cancelar el turno", "error");
      }
    } catch (e) {
      showNotification("Error al cancelar el turno", "error");
    }
  };

  // ayudas visuales
  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  };

  const colorSlot = (estado) => {
    if (estado === "OCUPADO") return "bg-red-100 border-red-300 hover:bg-red-200 cursor-pointer";
    if (estado === "CANCELADO") return "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60";
    return "bg-green-50 border-green-300 hover:bg-green-100 cursor-pointer";
  };

  const handleImprimir = (dia) => {
    const fechaStr = formatFecha(dia);
    const slotsDelDia = slotsPorDia(dia)
      .filter(s => s.estado === "OCUPADO");

    const filas = slotsDelDia.map(s => `
      <tr>
        <td>${s.horaInicio}</td>
        <td>${s.pacienteNombre || "-"}</td>
        <td>${s.pacienteNumAfiliado || "-"}</td>
        <td>${s.observaciones || ""}</td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Turnos - ${selectedProfesional.apellido} ${selectedProfesional.nombre} - ${fechaStr}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitulo { font-size: 14px; color: #555; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th { background: #1d4ed8; color: white; padding: 10px 12px; text-align: left; }
          td { padding: 9px 12px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) td { background: #f9fafb; }
          .sin-turnos { color: #888; font-style: italic; margin-top: 16px; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <h1>${selectedProfesional.apellido} ${selectedProfesional.nombre} </h1>
        <p class="subtitulo">
          Turnos del día: <strong>${DIAS[dia.getDay() - 1]} ${formatDisplay(dia)}/${dia.getFullYear()}</strong>
        </p>
        ${slotsDelDia.length === 0
          ? `<p class="sin-turnos">No hay turnos asignados para este día.</p>`
          : `<table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>N° Afiliado</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>${filas}</tbody>
             </table>`
        }
      </body>
      </html>
    `;

    const ventana = window.open("", "_blank");
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  };

  // Renderizado
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

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Turnos</h1>
        <p className="text-gray-600 mt-1">Asignación y gestión de turnos por profesional</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
            <select
              value={selectedEspecialidad}
              onChange={(e) => setSelectedEspecialidad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">Todas las especialidades</option>
              {especialidades.map(e => (
                <option key={e.id} value={e.id}>{e.descripcion}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profesional</label>
            <select
              value={selectedProfesional?.id || ""}
              onChange={(e) => {
                const prof = profesionalesFiltrados.find(p => p.id === parseInt(e.target.value));
                setSelectedProfesional(prof || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">Seleccionar profesional</option>
              {profesionalesFiltrados.map(p => (
                <option key={p.id} value={p.id}>{p.apellido} {p.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navegación de semana */}
      {selectedProfesional && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={semanaAnterior}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <ChevronLeft size={18} /> Semana anterior
          </button>
          <span className="font-semibold text-gray-700">
            {formatDisplay(diasSemana[0])} — {formatDisplay(diasSemana[5])} / {semanaBase.getFullYear()}
          </span>
          <button
            onClick={semanaSiguiente}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Semana siguiente <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Leyenda */}
      {selectedProfesional && (
        <div className="flex gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-300"></div>
            <span className="text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
            <span className="text-gray-600">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></div>
            <span className="text-gray-600">Cancelado</span>
          </div>
        </div>
      )}

      {/* Grilla semanal */}
      {!selectedProfesional ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <User size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Seleccioná un profesional para ver su agenda semanal</p>
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-gray-500">Cargando agenda...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-6 border-b">
            {diasSemana.map((dia, i) => (
              <div key={i} className="px-3 py-3 text-center border-r last:border-r-0 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase">{DIAS[i]}</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="font-semibold text-gray-800">{formatDisplay(dia)}</p>
                  <button
                    onClick={() => handleImprimir(dia)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title={`Imprimir turnos del ${DIAS[i]}`}
                  >
                    <Printer size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-6 divide-x min-h-48">
            {diasSemana.map((dia, i) => {
              const slotsDelDia = slotsPorDia(dia);
              return (
                <div key={i} className="p-2 flex flex-col gap-2">
                  {slotsDelDia.length === 0 ? (
                    <div className="text-center text-gray-300 text-xs mt-4">Sin turnos</div>
                  ) : (
                    slotsDelDia.map((slot, j) => (
                      <button
                        key={j}
                        onClick={() => slot.estado !== "CANCELADO" && handleSlotClick(slot)}
                        disabled={slot.estado === "CANCELADO"}
                        className={`w-full p-2 rounded-lg border text-left transition-all ${colorSlot(slot.estado)}`}
                      >
                        <p className="font-semibold text-gray-800 text-sm">{slot.horaInicio}</p>
                        <p className="text-xs text-gray-500">Cons. {slot.consultorioNumero}</p>
                        {slot.estado === "OCUPADO" && slot.pacienteNombre && (
                          <p className="text-xs text-red-700 font-medium mt-1 truncate">{slot.pacienteNombre}</p>
                        )}
                        {slot.estado === "DISPONIBLE" && (
                          <p className="text-xs text-green-600 mt-1">Disponible</p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal asignar / reasignar */}
      {showModal && modalSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {modalSlot.estado === "OCUPADO" ? "Turno ocupado" : "Asignar turno"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Info del slot */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Profesional:</span>
                <span className="font-medium">{selectedProfesional.apellido} {selectedProfesional.nombre} </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha:</span>
                <span className="font-medium">{modalSlot.fecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hora:</span>
                <span className="font-medium">{modalSlot.horaInicio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Consultorio:</span>
                <span className="font-medium">{modalSlot.consultorioNumero}</span>
              </div>
              {modalSlot.estado === "OCUPADO" && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paciente actual:</span>
                  <span className="font-medium text-red-600">{modalSlot.pacienteNombre}</span>
                </div>
              )}
            </div>

            {/* Buscador de paciente */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modalSlot.estado === "OCUPADO" ? "Reasignar a paciente:" : "Seleccionar paciente:"}
              </label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o CUIL..."
                  value={searchPaciente}
                  onChange={(e) => { setSearchPaciente(e.target.value); setPacienteSeleccionado(null); }}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Lista de resultados */}
              {searchPaciente.length > 1 && (
                <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                  {pacientesFiltrados.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-3">Sin resultados</p>
                  ) : (
                    pacientesFiltrados.slice(0, 8).map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setPacienteSeleccionado(p); setSearchPaciente(`${p.nombre} ${p.apellido}`); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 border-b last:border-b-0 ${
                          pacienteSeleccionado?.id === p.id ? "bg-blue-50 font-medium" : ""
                        }`}
                      >
                        <span className="font-medium">{p.nombre} {p.apellido}</span>
                        <span className="text-gray-400 ml-2 text-xs">{p.CUIL}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>

              {modalSlot.estado === "OCUPADO" && (
                <button
                  onClick={handleCancelar}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancelar turno
                </button>
              )}

              <button
                onClick={modalSlot.estado === "OCUPADO" ? handleReasignar : handleGuardarTurno}
                disabled={!pacienteSeleccionado}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {modalSlot.estado === "OCUPADO" ? "Reasignar" : "Asignar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Turnos;
