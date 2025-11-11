import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Search, Eye } from "lucide-react";

 const API_URL = "https://gestion-clinica-back.onrender.com/api";
// const API_URL = "http://localhost:8080/api";

function Especialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({
    descripcion: "",
    observaciones: ""
  });

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    try {
      // console.log("URL final:", `${API_URL}/api/especialidad`);
      const response = await fetch(`${API_URL}/especialidad`);
      const data = await response.json();
      setEspecialidades(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar especialidades:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingId 
        ? `${API_URL}/especialidad/${editingId}` 
        : `${API_URL}/especialidad`;
      
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchEspecialidades();
        closeModal();
      } else {
        const error = await response.text();
        alert("Error al guardar la especialidad: " + error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar la especialidad");
    }
  };

  const handleEdit = (especialidad) => {
    setEditingId(especialidad.id);
    setViewMode(false);
    setFormData({
      descripcion: especialidad.descripcion,
      observaciones: especialidad.observaciones || ""
    });
    setShowModal(true);
  };
  
  const handleView = (especialidad) => {
    setEditingId(especialidad.id);
    setViewMode(true);
    setFormData({
      descripcion: especialidad.descripcion,
      observaciones: especialidad.observaciones || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta especialidad?")) return;

    try {
      const response = await fetch(`${API_URL}/especialidad/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchEspecialidades();
        showNotification("Especialidad eliminada correctamente", "success");
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || "Error al eliminar la especialidad";
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
      descripcion: "",
      observaciones: ""
    });
  };

  const filteredEspecialidades = especialidades.filter(esp =>
    esp.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-gray-800">Especialidades</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Nueva Especialidad
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar especialidad..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEspecialidades.map((esp) => (
              <tr key={esp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{esp.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{esp.descripcion}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{esp.observaciones || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(esp)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(esp)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(esp.id)}
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
        {filteredEspecialidades.length === 0 && (
          <div className="text-center py-8 text-gray-500">No se encontraron especialidades</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {viewMode ? "Detalles de la Especialidad" : editingId ? "Editar Especialidad" : "Nueva Especialidad"}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                  <input
                    type="text"
                    required
                    disabled={viewMode}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Ej: Cardiología, Pediatría, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    disabled={viewMode}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows="4"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Información adicional sobre la especialidad..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  {viewMode ? 'Cerrar' : 'Cancelar'}
                </button>
                {!viewMode && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

export default Especialidades;