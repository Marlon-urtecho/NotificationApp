import React, { useEffect, useState } from "react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    username: "",
    phone_number: "",
    email: "",
    first_name: "",
    last_name: "",
    is_staff: false,
    is_active: true,
    is_superuser: false,
    password: "",
    groups: ["Admin", "Editor"],
    user_permissions: ["add_user", "change_user"],
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserDetails, setEditUserDetails] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/AutoMensaje/v1/users/",
      );
      if (!response.ok) throw new Error("Error al cargar los usuarios");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const editUser = (user) => {
    setEditUserDetails(user);
    setShowEditModal(true);
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/AutoMensaje/v1/users/${userId}/`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        throw new Error("Error al eliminar el usuario");
      }
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  const createUser = async () => {
    // Validación de campos
    if (!newUser.username || !newUser.password || !newUser.email) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/AutoMensaje/v1/users/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        },
      );
      if (!response.ok) {
        throw new Error("Error al crear el usuario");
      }
      const createdUser = await response.json();
      setUsers([...users, createdUser]);
      setShowCreateModal(false);
      setNewUser({
        username: "",
        phone_number: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        is_staff: false,
        is_active: true,
        is_superuser: false,
        groups: [],
        user_permissions: [],
      });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
    }
  };

  const updateUser = async () => {
    if (!editUserDetails.username || !editUserDetails.email) {
      alert("Por favor, completa los campos requeridos.");
      return;
    }

    const userData = { ...editUserDetails };
    if (!userData.password) {
      delete userData.password; // No enviar contraseña si no fue modificada
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/AutoMensaje/v1/users/${editUserDetails.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        },
      );

      if (!response.ok) throw new Error("Error al actualizar el usuario");
      const updatedUser = await response.json();
      setUsers(
        users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      );
      setShowEditModal(false);
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="textoCenter">Administración de Usuarios</h1>
      <button
        className="btn btn-sm btn-success mb-3"
        onClick={() => setShowCreateModal(true)}
      >
        Crear Nuevo Usuario
      </button>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre de Usuario</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Activo</th>
            <th>Staff</th>
            <th>Super Usuario</th>
            <th>Grupos</th>
            <th>Permisos</th>
            <th>Fecha Creación</th>
            <th>Fecha Última Actualización</th>
            <th className="flexbtn">Opciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.phone_number}</td>
                <td>{user.email}</td>
                <td>{user.is_active ? "Sí" : "No"}</td>
                <td>{user.is_staff ? "Sí" : "No"}</td>
                <td>{user.is_superuser ? "Sí" : "No"}</td>
                <td>
                  {user.groups && user.groups.length > 0
                    ? user.groups.join(", ")
                    : "Sin grupos"}
                </td>
                <td>
                  {user.user_permissions && user.user_permissions.length > 0
                    ? user.user_permissions.join(", ")
                    : "Sin permisos"}
                </td>
                <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                <td>{new Date(user.last_login).toLocaleDateString()}</td>
                <td className="flexbtn">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => editUser(user)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteUser(user.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12" className="text-center">
                Cargando...
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showCreateModal && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nuevo Usuario</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>
              <div className="modal-body">
                {/* Nombre de Usuario */}
                <div className="mb-3">
                  <label>Nombre de Usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                  />
                </div>

                {/* Contraseña */}
                <div className="mb-3">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </div>

                {/* Teléfono */}
                <div className="mb-3">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUser.phone_number}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone_number: e.target.value })
                    }
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>

                {/* Nombre */}
                <div className="mb-3">
                  <label>Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUser.first_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, first_name: e.target.value })
                    }
                  />
                </div>

                {/* Apellido */}
                <div className="mb-3">
                  <label>Apellido</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUser.last_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, last_name: e.target.value })
                    }
                  />
                </div>

                {/* Es Staff */}
                <div className="mb-3">
                  <label>Es Staff</label>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={newUser.is_staff}
                    onChange={(e) =>
                      setNewUser({ ...newUser, is_staff: e.target.checked })
                    }
                  />
                </div>

                {/* Es Activo */}
                <div className="mb-3">
                  <label>Es Activo</label>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={newUser.is_active}
                    onChange={(e) =>
                      setNewUser({ ...newUser, is_active: e.target.checked })
                    }
                  />
                </div>

                {/* Es Super Usuario */}
                <div className="mb-3">
                  <label>Es Super Usuario</label>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={newUser.is_superuser}
                    onChange={(e) =>
                      setNewUser({ ...newUser, is_superuser: e.target.checked })
                    }
                  />
                </div>

                {/* Grupos: Select con opciones */}
                <div className="mb-3">
                  <label>Grupos</label>
                  <select
                    multiple
                    className="form-control"
                    value={newUser.groups}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        groups: Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        ),
                      })
                    }
                  >
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                {/* Permisos: Select con opciones */}
                <div className="mb-3">
                  <label>Permisos</label>
                  <select
                    multiple
                    className="form-control"
                    value={newUser.user_permissions}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        user_permissions: Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        ),
                      })
                    }
                  >
                    <option value="add_user">add_user</option>
                    <option value="change_user">change_user</option>
                    <option value="delete_user">delete_user</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={createUser}>
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editUserDetails && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Usuario</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                />
              </div>
              <div className="modal-body">
                {/* Nombre de Usuario */}
                <div className="mb-3">
                  <label>Nombre de Usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editUserDetails.username}
                    onChange={(e) =>
                      setEditUserDetails({
                        ...editUserDetails,
                        username: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Contraseña */}
                <div className="mb-3">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={editUserDetails.password}
                    onChange={(e) =>
                      setEditUserDetails({
                        ...editUserDetails,
                        password: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Teléfono */}
                <div className="mb-3">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editUserDetails.phone_number}
                    onChange={(e) =>
                      setEditUserDetails({
                        ...editUserDetails,
                        phone_number: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editUserDetails.email}
                    onChange={(e) =>
                      setEditUserDetails({
                        ...editUserDetails,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Nombre */}
                <div className="mb-3">
                  <label>Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editUserDetails.first_name}
                    onChange={(e) =>
                      setEditUserDetails({
                        ...editUserDetails,
                        first_name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Apellido */}
                <div className="mb-3">
                  <label>Apellido</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editUserDetails.last_name}
                    onChange={(e) =>
                      setEditUserDetails({
                        ...editUserDetails,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Es Staff */}
                <div className="mb-3">
                  <label>Es Staff</label>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={editUserDetails.is_staff}
                    onChange={(e) =>
                      setEditUserDetails({
                        ...editUserDetails,
                        is_staff: e.target.checked,
                      })
                    }
                  />
                </div>

                {/* Es Activo */}
                <div className="mb-3">
                  <label>Es Activo</label>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={editUserDetails.is_active}
                    onChange={(e) =>
                      setEditUserDetails({
                        ...editUserDetails,
                        is_active: e.target.checked,
                      })
                    }
                  />
                </div>

                {/* Es Super Usuario */}
                <div className="mb-3">
                  <label>Es Super Usuario</label>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={editUserDetails.is_superuser}
                    onChange={(e) =>
                      setEditUserDetails({
                        ...editUserDetails,
                        is_superuser: e.target.checked,
                      })
                    }
                  />
                </div>

                {/* Grupos: Select con opciones */}
                <div className="mb-3">
                  <label>Grupos</label>
                  <select
                    multiple
                    className="form-control"
                    value={editUserDetails.groups}
                    onChange={(e) =>
                      setEditUserDetails({
                        ...editUserDetails,
                        groups: Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        ),
                      })
                    }
                  >
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                {/* Permisos: Select con opciones */}
                <div className="mb-3">
                  <label>Permisos</label>
                  <select
                    multiple
                    className="form-control"
                    value={editUserDetails.user_permissions}
                    onChange={(e) =>
                      setEditUserDetails({
                        ...editUserDetails,
                        user_permissions: Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        ),
                      })
                    }
                  >
                    <option value="add_user">add_user</option>
                    <option value="change_user">change_user</option>
                    <option value="delete_user">delete_user</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={updateUser}>
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
