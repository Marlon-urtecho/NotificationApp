import React, { useEffect, useState } from 'react';

function Users() {
  const [users, setUsers] = useState([]); // Estado para almacenar los usuarios
  const [newUser, setNewUser] = useState({
    username: '',
    phone_number: '',
    email: '',
    first_name: '',
    last_name: '',
    is_staff: false,
    is_active: true,
  }); // Estado para el nuevo usuario
  const [editingUser, setEditingUser] = useState(null); // Estado para el usuario que se va a editar
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Función para obtener los usuarios desde el backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/AutoMensaje/v1/users/');
      if (!response.ok) {
        throw new Error('Error al cargar los usuarios');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error al cargar los usuarios:', error);
    }
  };

  const createUser = async () => {
    // Validaciones
    if (!newUser.username || !newUser.phone_number || !newUser.email || !newUser.first_name || !newUser.last_name) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    // Validación de teléfono (formato de Nicaragua: 8 dígitos, empieza con 2, 7, 8 o 9)
    const phoneRegex = /^[2|7|8|9]{1}[0-9]{7}$/; // Formato de teléfono en Nicaragua
    if (!phoneRegex.test(newUser.phone_number)) {
      alert('El número de teléfono no es válido. Debe tener 8 dígitos y empezar con 2, 7, 8 o 9.');
      return;
    }

     // Verifica los datos antes de enviarlos

    try {
      const response = await fetch('http://127.0.0.1:8000/AutoMensaje/v1/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        
        fetchUsers();
        setShowCreateModal(false);
        setNewUser({
          username: '',
          phone_number: '',
          email: '',
          first_name: '',
          last_name: '',
          is_staff: false,
          is_active: true,
        });
      } else {
        const errorDetails = await response.json();
        console.error('Error:', errorDetails);
        alert(`Error al crear el usuario: ${errorDetails.message}`);
      }
    } catch (error) {
      console.error('Error al crear el usuario:', error);
    }
  };

  // Función para eliminar un usuario
  const deleteUser = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/AutoMensaje/v1/users/${id}/`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Usuario eliminado');
          fetchUsers();
        } else {
          alert('Error al eliminar el usuario');
        }
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
      }
    }
  };

  // Función para editar un usuario
  const editUser = (user) => {
    setEditingUser({ ...user });
  };

  // Función para actualizar un usuario
  const updateUser = async () => {
    if (editingUser) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/AutoMensaje/v1/users/${editingUser.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingUser),
        });
        if (response.ok) {
          alert('Usuario actualizado');
          fetchUsers();
          setEditingUser(null);
        } else {
          alert('Error al actualizar el usuario');
        }
      } catch (error) {
        console.error('Error al actualizar el usuario:', error);
      }
    }
  };

  // Usamos useEffect para cargar los usuarios cuando la página se monte
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h1>Usuarios</h1>
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
            <th>Opciones</th>
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
                <td>{user.is_active ? 'Sí' : 'No'}</td>
                <td>{user.is_staff ? 'Sí' : 'No'}</td>
                <td>
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
              <td colSpan="7" className="text-center">Cargando...</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal de Creación de Usuario */}
      {showCreateModal && (
      <div className="modal" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Crear Nuevo Usuario</h5>
              <button className="btn-close" onClick={() => setShowCreateModal(false)} />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label>Nombre de Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  value={newUser.phone_number}
                  onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Primer Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Es Staff</label>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={newUser.is_staff}
                  onChange={(e) => setNewUser({ ...newUser, is_staff: e.target.checked })}
                />
              </div>
              <div className="mb-3">
                <label>Está Activo</label>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={newUser.is_active}
                  onChange={(e) => setNewUser({ ...newUser, is_active: e.target.checked })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={createUser}>
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Modal de Edición de Usuario */}
      {editingUser && (
      <div className="modal" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar Usuario</h5>
              <button className="btn-close" onClick={() => setEditingUser(null)} />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label>Nombre de Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingUser.phone_number}
                  onChange={(e) => setEditingUser({ ...editingUser, phone_number: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Primer Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingUser.first_name}
                  onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingUser.last_name}
                  onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Es Staff</label>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={editingUser.is_staff}
                  onChange={(e) => setEditingUser({ ...editingUser, is_staff: e.target.checked })}
                />
              </div>
              <div className="mb-3">
                <label>Está Activo</label>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={editingUser.is_active}
                  onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={updateUser}>
                Actualizar Usuario
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default Users;
