import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Search, Eye } from "lucide-react";

// const API_URL = `${import.meta.env.VITE_API_URL}/api`;
const API_URL = "http://localhost:8080/api";

function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    CUIL: "",
    numAfiliado: "",
    mail: "",
    domicilio: "",
    nacimiento: "",
    sexo: "",
    observaciones: ""
  });

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      const response = await fetch(`${API_URL}/paciente`);
      const data = await response.json();
      setPacientes(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingId 
        ? `${API_URL}/paciente/${editingId}` 
        : `${API_URL}/paciente`;
      
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchPacientes();
        closeModal();
      } else {
        
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || "Error al guardar el paciente: ";
        showNotification(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar el paciente");
    }
  };

  const handleEdit = (paciente) => {
    setEditingId(paciente.id);
    setViewMode(false);
    setFormData({
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      CUIL: paciente.CUIL,
      numAfiliado: paciente.numAfiliado,
      mail: paciente.mail,
      domicilio: paciente.domicilio || "",
      nacimiento: paciente.nacimiento || "",
      sexo: paciente.sexo || "",
      observaciones: paciente.observaciones || ""
    });
    setShowModal(true);
  };
  
  const handleView = (paciente) => {
    setEditingId(paciente.id);
    setViewMode(true);
    setFormData({
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      CUIL: paciente.CUIL,
      numAfiliado: paciente.numAfiliado,
      mail: paciente.mail,
      domicilio: paciente.domicilio || "",
      nacimiento: paciente.nacimiento || "",
      sexo: paciente.sexo || "",
      observaciones: paciente.observaciones || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este paciente?")) return;

    try {
      const response = await fetch(`${API_URL}/paciente/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchPacientes();
      } else {
        alert("Error al eliminar el paciente");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el paciente");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setViewMode(false);
    setFormData({
      nombre: "",
      apellido: "",
      CUIL: "",
      numAfiliado: "",
      mail: "",
      domicilio: "",
      nacimiento: "",
      sexo: "",
      observaciones: ""
    });
  };

  const filteredPacientes = pacientes.filter(pac =>
    pac.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pac.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pac.CUIL.includes(searchTerm) ||
    pac.numAfiliado.includes(searchTerm)
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
        <h1 className="text-3xl font-bold text-gray-800">Pacientes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 !bg-blue-600 !text-white px-4 py-2 rounded-lg hover:!bg-blue-700 transition"
        >
          <Plus size={20} />
          Nuevo Paciente
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, CUIL o N° de afiliado..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUIL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Afiliado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPacientes.map((pac) => (
              <tr key={pac.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pac.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pac.apellido}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pac.CUIL}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pac.numAfiliado}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pac.mail}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(pac)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(pac)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(pac.id)}
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
        {filteredPacientes.length === 0 && (
          <div className="text-center py-8 text-gray-500">No se encontraron pacientes</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {viewMode ? "Detalles del Paciente" : editingId ? "Editar Paciente" : "Nuevo Paciente"}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    disabled={viewMode}
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CUIL *</label>
                  <input
                    type="text"
                    required
                    disabled={viewMode}
                    value={formData.CUIL}
                    onChange={(e) => setFormData({ ...formData, CUIL: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° Afiliado *</label>
                  <input
                    type="text"
                    required
                    disabled={viewMode}
                    value={formData.numAfiliado}
                    onChange={(e) => setFormData({ ...formData, numAfiliado: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domicilio</label>
                  <input
                    type="text"
                    disabled={viewMode}
                    value={formData.domicilio}
                    onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    disabled={viewMode}
                    value={formData.nacimiento ? formData.nacimiento.split("T")[0].split(" ")[0] : ""}
                    onChange={(e) => setFormData({ ...formData, nacimiento: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select
                    disabled={viewMode}
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${viewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
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

export default Pacientes;