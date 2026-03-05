import { useState, useEffect } from "react";
import { Plus, Trash2, X, Shield, User, KeyRound } from "lucide-react";

// const API_URL = "https://gestion-clinica-back.onrender.com/api";
const API_URL = "http://localhost:8080/api";

function Usuarios({ usuarioActual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({
    user: "", password: "", permisos: "user", observaciones: ""
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/usuarios`);
      setUsuarios(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showNotification("Usuario creado correctamente", "success");
        setShowModal(false);
        setFormData({ user: "", password: "", permisos: "user", observaciones: "" });
        fetchUsuarios();
      } else {
        const err = await res.json().catch(() => null);
        showNotification(err?.message || "Error al crear el usuario", "error");
      }
    } catch (e) {
      showNotification("Error al crear el usuario", "error");
    }
  };

  const handleAbrirCambioPassword = (usuario) => {
    setUsuarioEditando(usuario);
    setNuevaPassword("");
    setShowPasswordModal(true);
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/usuarios/${usuarioEditando.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevaPassword })
      });
      if (res.ok) {
        showNotification("Contraseña actualizada correctamente", "success");
        setShowPasswordModal(false);
      } else {
        const err = await res.json().catch(() => null);
        showNotification(err?.message || "Error al cambiar la contraseña", "error");
      }
    } catch (e) {
      showNotification("Error al cambiar la contraseña", "error");
    }
  };

  const handleEliminar = async (id) => {
    if (id === usuarioActual?.id) {
      showNotification("No podés eliminar tu propio usuario", "error");
      return;
    }
    if (!confirm("¿Eliminar este usuario?")) return;

    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Usuario eliminado", "success");
        fetchUsuarios();
      } else {
        showNotification("Error al eliminar el usuario", "error");
      }
    } catch (e) {
      showNotification("Error al eliminar el usuario", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${
          notification.type === "success" ? "bg-green-500" :
          notification.type === "error" ? "bg-red-500" : "bg-blue-500"
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-600 mt-1">Gestión de acceso al sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 !bg-blue-600 !text-white px-4 py-2 rounded-lg hover:!bg-blue-700 transition"
        >
          <Plus size={20} /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permisos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observaciones</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      u.permisos === "admin" ? "bg-purple-100" : "bg-blue-100"
                    }`}>
                      {u.permisos === "admin"
                        ? <Shield size={16} className="text-purple-600" />
                        : <User size={16} className="text-blue-600" />}
                    </div>
                    <span className="font-medium text-gray-900">{u.user}</span>
                    {u.id === usuarioActual?.id && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Vos</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    u.permisos === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {u.permisos}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.observaciones || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAbrirCambioPassword(u)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Cambiar contraseña"
                    >
                      <KeyRound size={18} />
                    </button>
                    <button
                      onClick={() => handleEliminar(u.id)}
                      disabled={u.id === usuarioActual?.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed"
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
        {usuarios.length === 0 && (
          <div className="text-center py-8 text-gray-400">No hay usuarios registrados</div>
        )}
      </div>

      {/* Modal nuevo usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Nuevo Usuario</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                <input
                  type="text"
                  required
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  placeholder="nombreusuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permisos *</label>
                <select
                  value={formData.permisos}
                  onChange={(e) => setFormData({ ...formData, permisos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <input
                  type="text"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 !bg-blue-600 !text-white rounded-lg hover:!bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal cambiar contraseña */}
      {showPasswordModal && usuarioEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Cambiar Contraseña</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Cambiando contraseña de <span className="font-semibold">{usuarioEditando.user}</span>
            </p>

            <form onSubmit={handleCambiarPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña *</label>
                <input
                  type="password"
                  required
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 !bg-yellow-500 !text-white rounded-lg hover:!bg-yellow-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
