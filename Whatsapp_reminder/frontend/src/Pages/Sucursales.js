import "bootstrap/dist/css/bootstrap.min.css"; // Importar Bootstrap
import "datatables.net"; // Importar DataTables
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css"; // Importar DataTable CSS
import "font-awesome/css/font-awesome.min.css"; // Importar Font Awesome
import $ from "jquery"; // Asegúrate de importar jQuery
import "jszip"; // Para la exportación CSV, Excel, etc.
import "pdfmake/build/pdfmake"; // Para la exportación a PDF
import "pdfmake/build/vfs_fonts"; // Para las fuentes de PDF
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Sucursales() {
  const [sucursales, setSucursales] = useState([]); // Estado para almacenar las sucursales
  const [dataTable, setDataTable] = useState(null); // Estado para almacenar la instancia de DataTable
  const [editingSucursal, setEditingSucursal] = useState(null); // Estado para almacenar la sucursal que está siendo editada
  const [newSucursal, setNewSucursal] = useState({}); // Estado para almacenar los datos de la nueva sucursal
  const [showCreateModal, setShowCreateModal] = useState(false); // Estado para controlar la visibilidad del modal de creación
  const [users, setUsers] = useState([]); // Estado para almacenar los usuarios
  const [selectedUserId, setSelectedUserId] = useState(null); // Estado para el ID del usuario seleccionado
  const [error, setError] = useState(null); // Estado para manejar errores
  const navigate = useNavigate();

  const dataTableOptions = {
    columnDefs: [
      { className: "centered", targets: [0, 1, 2, 3, 4] },
      { orderable: false, targets: [4] },
      { searchable: false, targets: [0, 4] },
    ],
    pageLength: 4,
    destroy: true,
    dom: "Bfrtip", // Asegúrate de que los botones estén en el DOM
    buttons: ["copy", "csv", "excel", "pdf", "print"],
    language: {
      search: "Buscar:",
      lengthMenu: "Mostrar _MENU_ registros por página",
      info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
      paginate: {
        first: "Primero",
        last: "Último",
        next: "Siguiente",
        previous: "Anterior",
      },
      emptyTable: "No hay datos disponibles",
    },
  };

  // Referencia para la tabla
  const tableRef = useRef(null);

  // Función para inicializar la DataTable
  const initDataTable = () => {
    if (dataTable) {
      dataTable.destroy(); // Destruir la instancia anterior
    }
    const newDataTable = $(tableRef.current).DataTable(dataTableOptions);
    setDataTable(newDataTable);
  };

  // Función para obtener las sucursales desde el backend usando axios
  const fetchSucursales = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      navigate("/login"); // Redirige al login
      return;
    }

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/AutoMensaje/v1/sucursales/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSucursales(response.data); // Actualizar el estado con los datos de las sucursales
    } catch (error) {
      console.error("Error al cargar las sucursales:", error);
      setError("Hubo un problema al cargar las sucursales.");
    }
  };

  // Función para obtener los usuarios desde el backend usando axios
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      navigate("/login"); // Redirige al login
      return;
    }

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/AutoMensaje/v1/users/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setUsers(response.data); // Establecer los usuarios en el estado
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
      setError("Hubo un problema al cargar los usuarios.");
    }
  };

  // Función para eliminar una sucursal usando axios
  const deleteSucursal = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta sucursal?")) {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/AutoMensaje/v1/sucursales/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.status === 204) {
          alert("Sucursal eliminada");
          fetchSucursales(); // Recargar la lista de sucursales
        } else {
          alert("Error al eliminar la sucursal");
        }
      } catch (error) {
        console.error("Error al eliminar la sucursal:", error);
        setError("Hubo un problema al eliminar la sucursal.");
      }
    }
  };

  // Función para editar una sucursal
  const editSucursal = (sucursal) => {
    setEditingSucursal(sucursal); // Establecer la sucursal a editar
  };

  // Función para actualizar una sucursal usando axios
  const updateSucursal = async () => {
    if (editingSucursal) {
      const sucursalData = {
        nombre: editingSucursal.nombre,
        direccion: editingSucursal.direccion,
        telefono: editingSucursal.telefono,
        email: editingSucursal.email,
        user_id: editingSucursal.user, // Asegúrate de pasar solo el ID del usuario
      };

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.put(
          `http://127.0.0.1:8000/AutoMensaje/v1/sucursales/${editingSucursal.id}/`,
          sucursalData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.status === 200) {
          alert("Sucursal actualizada");
          fetchSucursales(); // Recargar la lista de sucursales
          setEditingSucursal(null); // Limpiar la sucursal que está siendo editada
        } else {
          alert("Error al actualizar la sucursal");
        }
      } catch (error) {
        console.error("Error al actualizar la sucursal:", error);
        setError("Hubo un problema al actualizar la sucursal.");
      }
    }
  };

  // Función para manejar cambios en el formulario de creación
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewSucursal({
      ...newSucursal,
      [name]: value,
    });
  };

  // Función para crear una sucursal usando axios
  const createSucursal = async () => {
    const sucursalData = {
      nombre: newSucursal.nombre,
      direccion: newSucursal.direccion,
      telefono: newSucursal.telefono,
      email: newSucursal.email,
      user_id: newSucursal.user, // Asegúrate de pasar solo el ID del usuario
    };

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/AutoMensaje/v1/sucursales/",
        sucursalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status === 201) {
        alert("Sucursal creada con éxito");
        fetchSucursales(); // Recargar la lista de sucursales
      } else {
        alert("Error al crear la sucursal");
      }
    } catch (error) {
      console.error("Error al crear la sucursal:", error);
      setError("Hubo un problema al crear la sucursal.");
    }
  };

  // Usamos useEffect para cargar las sucursales y usuarios
  useEffect(() => {
    fetchSucursales(); // Traer las sucursales desde el backend
    fetchUsers(); // Traer los usuarios desde el backend
  }, []);

  // Usamos otro useEffect para inicializar DataTable cuando las sucursales estén listas
  useEffect(() => {
    if (sucursales.length > 0) {
      initDataTable(); // Inicializar la DataTable solo cuando las sucursales estén disponibles
    }
  }, [sucursales]);

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="textoCenter">Administración de Sucursales</h2>
          <div className="table-responsive">
            <button
              className="btn btn-sm btn-success mb-3"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="fa-solid "></i> Crear Nueva Sucursal
            </button>
            <table id="datatable-sucursales" className="table">
              <caption>Sucursales desde Django + DataTable.js</caption>
              <thead>
                <tr>
                  <th className="centered">#</th>
                  <th className="centered">Nombre</th>
                  <th className="centered">Dirección</th>
                  <th className="centered">Teléfono</th>
                  <th className="centered">Email</th>
                  <th className="centered">Usuario</th>
                  <th className="centered flexbtn">Opciones</th>
                </tr>
              </thead>
              <tbody>
                {sucursales.length > 0 ? (
                  sucursales.map((sucursal, index) => (
                    <tr key={sucursal.id}>
                      <td>{index + 1}</td>
                      <td>{sucursal.nombre}</td>
                      <td>{sucursal.direccion}</td>
                      <td>{sucursal.telefono}</td>
                      <td>{sucursal.email}</td>
                      <td>
                        {sucursal.user && sucursal.user.username
                          ? sucursal.user.username
                          : "No asignado"}
                      </td>
                      <td className="flexbtn">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => editSucursal(sucursal)}
                        >
                          Actualizar
                          <i className="fa-solid "></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteSucursal(sucursal.id)}
                        >
                          Borrar
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Cargando...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Creación de Sucursal */}
      {showCreateModal && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nueva Sucursal</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre"
                    value={newSucursal.nombre || ""}
                    onChange={handleCreateChange}
                  />
                </div>
                <div className="mb-3">
                  <label>Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    name="direccion"
                    value={newSucursal.direccion || ""}
                    onChange={handleCreateChange}
                  />
                </div>
                <div className="mb-3">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    name="telefono"
                    value={newSucursal.telefono || ""}
                    onChange={handleCreateChange}
                  />
                </div>
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={newSucursal.email || ""}
                    onChange={handleCreateChange}
                  />
                </div>
                <div className="mb-3">
                  <label>Usuario</label>
                  <select
                    className="form-control"
                    name="user"
                    value={newSucursal.user || ""}
                    onChange={handleCreateChange} // Maneja solo el ID
                  >
                    <option value="">Seleccionar Usuario</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
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
                <button className="btn btn-primary" onClick={createSucursal}>
                  Crear Sucursal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Sucursal */}
      {editingSucursal && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Sucursal</h5>
                <button
                  className="btn-close"
                  onClick={() => setEditingSucursal(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre"
                    value={editingSucursal.nombre || ""}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setEditingSucursal({
                        ...editingSucursal,
                        [name]: value,
                      });
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label>Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    name="direccion"
                    value={editingSucursal.direccion || ""}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setEditingSucursal({
                        ...editingSucursal,
                        [name]: value,
                      });
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    name="telefono"
                    value={editingSucursal.telefono || ""}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setEditingSucursal({
                        ...editingSucursal,
                        [name]: value,
                      });
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={editingSucursal.email || ""}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setEditingSucursal({
                        ...editingSucursal,
                        [name]: value,
                      });
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label>Usuario</label>
                  <select
                    className="form-control"
                    name="user"
                    value={editingSucursal.user || ""}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setEditingSucursal({
                        ...editingSucursal,
                        [name]: value,
                      });
                    }}
                  >
                    <option value="">Seleccionar Usuario</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingSucursal(null)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={updateSucursal}>
                  Actualizar Sucursal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sucursales;
