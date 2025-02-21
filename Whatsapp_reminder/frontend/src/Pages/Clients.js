import 'bootstrap/dist/css/bootstrap.min.css'; // Importar Bootstrap
import 'datatables.net'; // Importar DataTables
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'; // Importar DataTable CSS
import 'font-awesome/css/font-awesome.min.css'; // Importar Font Awesome
import $ from 'jquery'; // Asegúrate de importar jQuery;
import 'jszip'; // Para la exportación CSV, Excel, etc.
import 'pdfmake/build/pdfmake'; // Para la exportación a PDF
import 'pdfmake/build/vfs_fonts'; // Para las fuentes de PDF
import React, { useEffect, useRef, useState } from 'react';

function Clients() {
    const [clients, setClients] = useState([]); // Estado para almacenar los clientes
    const [dataTable, setDataTable] = useState(null); // Estado para almacenar la instancia de DataTable
    const [sucursales, setSucursales] = useState([]); // Estado para almacenar las sucursales
    const [editingClient, setEditingClient] = useState(null); // Estado para almacenar el cliente que está siendo editado
    const [newClient, setNewClient] = useState({}); // Estado para almacenar los datos del nuevo cliente
    const [showCreateModal, setShowCreateModal] = useState(false); // Estado para controlar la visibilidad del modal de creación

    const dataTableOptions = {
        columnDefs: [
            { className: 'text-center', targets: [0, 1, 2, 3] },
            { orderable: false, targets: [4] },
            { searchable: false, targets: [5, 6] }
        ],
        pageLength: 10,
        destroy: true,
        dom: 'Bfrtip', // Asegúrate de que los botones estén en el DOM
        buttons: [
            'copy', 
            'csv', 
            'excel', 
            'pdf', 
            'print'
        ],
        language: {
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros por página",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            },
            emptyTable: "No hay datos disponibles"
        }
    };

    // Referencia para la tabla
    const tableRef = useRef(null);

    // Función para inicializar la DataTable
    const initDataTable = () => {
        if (dataTable) {
            dataTable.destroy(); // Destruir la instancia anterior
        }
        // Inicializar la DataTable con las opciones proporcionadas
        const newDataTable = $(tableRef.current).DataTable(dataTableOptions);
        setDataTable(newDataTable); // Guardar la instancia de DataTable
    };

    // Función para obtener los clientes desde el backend Django
    const fetchClients = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/AutoMensaje/v1/clientes/');
            if (!response.ok) {
                throw new Error('Error al cargar los clientes');
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setClients(data); // Actualizar el estado con los datos de los clientes
            } else {
                console.error('Error: los datos de clientes no están en el formato esperado', data);
            }
        } catch (error) {
            console.error('Error al cargar los clientes:', error);
        }
    };

    // Función para obtener las sucursales desde el backend Django
    const fetchSucursales = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/AutoMensaje/v1/sucursales/');
            if (!response.ok) {
                throw new Error('Error al cargar las sucursales');
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setSucursales(data); // Actualizar el estado con las sucursales
            } else {
                console.error('Error: las sucursales no están en el formato esperado', data);
            }
        } catch (error) {
            console.error('Error al cargar las sucursales:', error);
        }
    };

    // Función para eliminar un cliente
    const deleteClient = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/AutoMensaje/v1/clientes/${id}/`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert('Cliente eliminado');
                    fetchClients(); // Recargar la lista de clientes
                } else {
                    alert('Error al eliminar el cliente');
                }
            } catch (error) {
                console.error('Error al eliminar el cliente:', error);
            }
        }
    };

    // Función para editar un cliente
    const editClient = (client) => {
        setEditingClient(client); // Establecer el cliente a editar
    };

    // Función para actualizar un cliente
    const updateClient = async () => {
        if (editingClient) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/AutoMensaje/v1/clientes/${editingClient.id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(editingClient),
                });

                if (response.ok) {
                    alert('Cliente actualizado');
                    fetchClients(); // Recargar la lista de clientes
                    setEditingClient(null); // Limpiar el cliente que está siendo editado
                } else {
                    const errorData = await response.json(); // Obtener los detalles del error
                    console.error('Error al actualizar el cliente:', errorData);
                    alert('Error al actualizar el cliente');
                }
            } catch (error) {
                console.error('Error al actualizar el cliente:', error);
            }
        }
    };

    // Función para manejar cambios en el formulario de edición
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingClient({
            ...editingClient,
            [name]: name === 'sucursal' ? parseInt(value) : value, // Aseguramos que la sucursal sea un número entero
        });
    };

    // Función para manejar cambios en el formulario de creación
    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setNewClient({
            ...newClient,
            [name]: name === 'precio' ? parseFloat(value) : name === 'sucursal' ? parseInt(value) : value, // Convertir precio y sucursal correctamente
        });
    };

    // Función para crear un cliente
    const createClient = async () => {
        console.log('Datos del cliente:', newClient); // Ver los datos antes de enviarlos

        // Asegúrate de que la fecha esté en formato correcto (YYYY-MM-DD)
        const formattedDate = newClient.fecha_renovacion ? newClient.fecha_renovacion.split('T')[0] : '';

        const clientToCreate = {
            ...newClient,
            fecha_renovacion: formattedDate, // Formatear la fecha de renovación
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/AutoMensaje/v1/clientes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientToCreate),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Detalles del error:', errorData); // Ver los detalles del error
                alert('Error al crear el cliente');
            } else {
                alert('Nuevo cliente creado');
                fetchClients(); // Recargar la lista de clientes
                setShowCreateModal(false); // Cerrar el modal de creación
                setNewClient({}); // Limpiar el formulario
            }
        } catch (error) {
            console.error('Error al crear el cliente:', error);
        }
    };

    // Usamos useEffect para cargar los clientes y las sucursales
    useEffect(() => {
        fetchClients(); // Traer los datos de los clientes desde Django
        fetchSucursales(); // Traer las sucursales
    }, []);

    // Usamos otro useEffect para inicializar DataTable cuando los clientes estén listos
    useEffect(() => {
        if (clients.length > 0) {
            initDataTable(); // Inicializar la DataTable solo cuando los clientes estén disponibles
        }
    }, [clients]);

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <h2 className="textoCenter" >Administración de Clientes</h2>
                    <div className="table-responsive">
                        <button
                            className="btn btn-sm btn-success mb-3"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="fa-solid "></i> + Crear Nuevo Cliente
                        </button>
                        <table ref={tableRef} id="datatable-clients" className="table">
                            <caption>Clientes desde la base de Datos y Django</caption>
                            <thead>
                                <tr>
                                    <th className="centered">#</th>
                                    <th className="centered">Nombre</th>
                                    <th className="centered">Teléfono</th>
                                    <th className="centered">Placa</th>
                                    <th className="centered">Poliza</th>
                                    <th className="centered">Fecha de Renovación</th>
                                    <th className="centered">Precio</th>
                                    <th className="centered">Sucursal</th>
                                    <th className="centered flexbtn">Opciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.length > 0 ? (
                                    clients.map((client, index) => (
                                        <tr key={client.id}>
                                            <td>{index + 1}</td>
                                            <td>{client.nombre}</td>
                                            <td>{client.telefono}</td>
                                            <td>{client.placa}</td>
                                            <td>{client.poliza}</td>
                                            <td>{client.fecha_renovacion}</td>
                                            <td>{client.precio}</td>
                                            <td>{client.sucursal ? client.sucursal.nombre : 'No asignada'}</td>
                                            <td className='flexbtn'>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => editClient(client)}
                                                >
                                                        Actualizar
                                                    <i className="fa-solid fa-pen-to-square me-1"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => deleteClient(client.id)}
                                                >
                                                    Borrar
                                                    <i className="fa-solid fa-trash-can me-1"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">Cargando...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Creación de Cliente */}
            {showCreateModal && (
                <div className="modal" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Crear Nuevo Cliente</h5>
                                <button className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombre"
                                        value={newClient.nombre || ''}
                                        onChange={handleCreateChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="telefono"
                                        value={newClient.telefono || ''}
                                        onChange={handleCreateChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Placa</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="placa"
                                        value={newClient.placa || ''}
                                        onChange={handleCreateChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Poliza</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="poliza"
                                        value={newClient.poliza || ''}
                                        onChange={handleCreateChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Fecha de Renovación</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="fecha_renovacion"
                                        value={newClient.fecha_renovacion || ''}
                                        onChange={handleCreateChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Precio</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="precio"
                                        value={newClient.precio || ''}
                                        onChange={handleCreateChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label>Sucursal</label>
                                    <select
                                        className="form-control"
                                        name="sucursal"
                                        value={newClient.sucursal || ''}
                                        onChange={handleCreateChange}>
                                        <option value="">Seleccione una sucursal</option>
                                        {sucursales.map((sucursal) => (
                                            <option key={sucursal.id} value={sucursal.id}>
                                                {sucursal.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={createClient}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición de Cliente */}
            {editingClient && (
                <div className="modal" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Editar Cliente</h5>
                                <button className="btn-close" onClick={() => setEditingClient(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombre"
                                        value={editingClient.nombre || ''}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="telefono"
                                        value={editingClient.telefono || ''}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Placa</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="placa"
                                        value={editingClient.placa || ''}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Poliza</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="poliza"
                                        value={editingClient.poliza || ''}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Fecha de Renovación</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="fecha_renovacion"
                                        value={editingClient.fecha_renovacion || ''}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Precio</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="precio"
                                        value={editingClient.precio || ''}
                                        onChange={handleEditChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label>Sucursal</label>
                                    <select
                                        className="form-control"
                                        name="sucursal"
                                        value={editingClient.sucursal || ''}
                                        onChange={handleEditChange}>
                                        <option value="">Seleccione una sucursal</option>
                                        {sucursales.map((sucursal) => (
                                            <option key={sucursal.id} value={sucursal.id}>
                                                {sucursal.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setEditingClient(null)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={updateClient}>Guardar cambios</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
  );
}

export default Clients;