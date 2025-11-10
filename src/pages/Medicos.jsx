import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Search, Eye } from "lucide-react";

const API_URL = "http://localhost:8080/api";

function Medicos() {
  const [profesionales, setProfesionales] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({
    nombre: "",
    cuil: "",
    telefono: "",
    mail: "",
    nacimiento: "",
    observaciones: "",
    duracion_turno_id: 3,
    matriculas: [{ numeroMatricula: "", especialidadId: "" }]
  });

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  useEffect(() => {
    fetchProfesionales();
    fetchEspecialidades();
  }, []);

  const fetchProfesionales = async () => {
    try {
      const response = await fetch(`${API_URL}/profesional`);
      const data = await response.json();
      setProfesionales(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar profesionales:", error);
      setLoading(false);
    }
  };
  
  const fetchEspecialidades = async () => {
    try {
      const response = await fetch(`${API_URL}/especialidad`);
      const data = await response.json();
      setEspecialidades(data);
    } catch (error) {
      console.error("Error al cargar especialidades:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingId 
        ? `${API_URL}/profesional/${editingId}` 
        : `${API_URL}/profesional`;
      
      const method = editingId ? "PUT" : "POST";

      const body = {
        nombre: formData.nombre,
        cuil: formData.cuil,
        telefono: formData.telefono,
        mail: formData.mail,
        nacimiento: formData.nacimiento,
        observaciones: formData.observaciones,
        duracion_turno_id: formData.duracion_turno_id,
        matriculas: formData.matriculas.map(m => ({
          numeroMatricula: m.numeroMatricula,
          especialidadId: parseInt(m.especialidadId)
        }))
      };

      console.log("Enviando:", body); // Para debug

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchProfesionales();
        closeModal();
      } else {

        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || "Error al guardar el profesional";
        showNotification(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Error al guardar el profesionalcho ", "error");

    }
  };

  const handleEdit = (profesional) => {
    setEditingId(profesional.id);
    setViewMode(false);
    setFormData({
      nombre: profesional.nombre,
      cuil: profesional.cuil,
      telefono: profesional.telefono,
      mail: profesional.mail,
      nacimiento: profesional.nacimiento,
      observaciones: profesional.observaciones || "",
      duracion_turno_id: 3,
      matriculas: Array.isArray(profesional.matriculas) && profesional.matriculas.length > 0 
        ? profesional.matriculas.map(m => ({
            numeroMatricula: m.numeroMatricula || "",
            especialidadId: m.especialidad?.id || ""
          }))
        : [{ numeroMatricula: "", especialidadId: "" }]
    });
    setShowModal(true);
  };
  
  const handleView = (profesional) => {
    setEditingId(profesional.id);
    setViewMode(true);
    setFormData({
      nombre: profesional.nombre,
      cuil: profesional.cuil,
      telefono: profesional.telefono,
      mail: profesional.mail,
      nacimiento: profesional.nacimiento,
      observaciones: profesional.observaciones || "",
      duracion_turno_id: 3,
      matriculas: Array.isArray(profesional.matriculas) && profesional.matriculas.length > 0 
        ? profesional.matriculas.map(m => ({
            numeroMatricula: m.numeroMatricula || "",
            especialidadId: m.especialidad?.id || ""
          }))
        : [{ numeroMatricula: "", especialidadId: "" }]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este profesional?")) return;

    try {
      const response = await fetch(`${API_URL}/profesional/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchProfesionales();
        showNotification("Profesional eliminado correctamente", "success");
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || "Error al eliminar el profesional";
        showNotification(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Error al eliminar la especialidad", "error");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setViewMode(false);
    setFormData({
      nombre: "",
      cuil: "",
      telefono: "",
      mail: "",
      nacimiento: "",
      observaciones: "",
      duracion_turno_id: 3,
      matriculas: [{ numeroMatricula: "", especialidadId: "" }]
    });
  };

  const addMatricula = () => {
    setFormData({
      ...formData,
      matriculas: [...formData.matriculas, { numeroMatricula: "", especialidadId: "" }]
    });
  };

  const removeMatricula = (index) => {
    const newMatriculas = formData.matriculas.filter((_, i) => i !== index);
    setFormData({ ...formData, matriculas: newMatriculas });
  };

  const updateMatricula = (index, field, value) => {
    const newMatriculas = [...formData.matriculas];
    newMatriculas[index][field] = value;
    setFormData({ ...formData, matriculas: newMatriculas });
  };

  const filteredProfesionales = profesionales.filter(prof =>
    prof.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.cuil.includes(searchTerm) ||
    (Array.isArray(prof.matriculas) && prof.matriculas.some(m => m.numeroMatricula.includes(searchTerm)))
  );

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Profesionales</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 !bg-blue-600 !text-white px-4 py-2 rounded-lg hover:!bg-blue-700 transition"
        >
          <Plus size={20} />
          Nuevo Profesional
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, matrícula o CUIL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUIL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrículas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProfesionales.map((prof) => (
              <tr key={prof.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prof.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prof.cuil}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prof.telefono}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {Array.isArray(prof.matriculas) && prof.matriculas.length > 0 
                    ? prof.matriculas.map((m, idx) => (
                        <div key={idx} className="mb-1">
                          <span className="font-semibold">{m.numeroMatricula}</span> - {m.especialidad?.descripcion || 'Sin especialidad'}
                        </div>
                      ))
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(prof)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(prof)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(prof.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProfesionales.length === 0 && (
          <div className="text-center py-8 text-gray-500">No se encontraron profesionales</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {viewMode ? "Detalles del Profesional" : editingId ? "Editar Profesional" : "Nuevo Profesional"}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    disabled={viewMode}
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CUIL *</label>
                  <input
                    type="text"
                    required
                    disabled={viewMode}
                    value={formData.cuil}
                    onChange={(e) => setFormData({ ...formData, cuil: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                  <input
                    type="tel"
                    required
                    disabled={viewMode}
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    disabled={viewMode}
                    value={formData.mail}
                    onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    required
                    disabled={viewMode}
                    value={formData.nacimiento}
                    onChange={(e) => setFormData({ ...formData, nacimiento: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    disabled={viewMode}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows="3"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              {/* Matrículas */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Matrículas y Especialidades *</label>
                  {!viewMode && (
                    <button
                      type="button"
                      onClick={addMatricula}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Plus size={16} />
                      Agregar Matrícula
                    </button>
                  )}
                </div>

                {formData.matriculas.map((matricula, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      required
                      disabled={viewMode}
                      placeholder="Número de matrícula"
                      value={matricula.numeroMatricula}
                      onChange={(e) => updateMatricula(index, 'numeroMatricula', e.target.value)}
                      className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    <select
                      required
                      disabled={viewMode}
                      value={matricula.especialidadId}
                      onChange={(e) => updateMatricula(index, 'especialidadId', e.target.value)}
                      className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Seleccionar especialidad</option>
                      {especialidades.map((esp) => (
                        <option key={esp.id} value={esp.id}>
                          {esp.descripcion}
                        </option>
                      ))}
                    </select>
                    {!viewMode && formData.matriculas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMatricula(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  {viewMode ? 'Cerrar' : 'Cancelar'}
                </button>
                {!viewMode && (
                  <button
                    type="submit"
                    className="px-4 py-2 !bg-blue-600 !text-white rounded-lg hover:!bg-blue-700"
                  >
                    {editingId ? "Actualizar" : "Crear"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Medicos;