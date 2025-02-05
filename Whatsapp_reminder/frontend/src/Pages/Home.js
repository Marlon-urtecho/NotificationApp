import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Necesitarás instalar la librería `xlsx` para leer archivos Excel
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
    const [newClient, setNewClient] = useState({
        nombre: '',
        telefono: '',
        placa: '',
        poliza: '',
        fecha_renovacion: '',
        precio: '',
        sucursal: '',  // Ahora la sucursal es un ID que se seleccionará del combo box
    });

    const [clients, setClients] = useState([]); // Para almacenar clientes importados desde Excel
    const [sucursales, setSucursales] = useState([]); // Para almacenar las sucursales disponibles

    // Cargar las sucursales desde la API
    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/AutoMensaje/v1/sucursales/');
                if (response.ok) {
                    const data = await response.json();
                    setSucursales(data); // Guardamos las sucursales obtenidas
                } else {
                    console.error('Error al cargar sucursales');
                }
            } catch (error) {
                console.error('Error de red al obtener sucursales', error);
            }
        };

        fetchSucursales();
    }, []);

    // Función para manejar cambios en el formulario de cliente
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewClient({
            ...newClient,
            [name]: value,
        });
    };

    // Función para crear un cliente
    const createClient = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/AutoMensaje/v1/clientes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newClient),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Detalles del error:', errorData);
                alert('Error al crear el cliente');
            } else {
                alert('Nuevo cliente creado');
                setNewClient({
                    nombre: '',
                    telefono: '',
                    placa: '',
                    poliza: '',
                    fecha_renovacion: '',
                    precio: '',
                    sucursal: '',
                }); // Limpiar el formulario
            }
        } catch (error) {
            console.error('Error al crear el cliente:', error);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
    
            // Asumimos que el archivo Excel tiene solo una hoja
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
    
            // Convertir la hoja a un formato JSON comenzando desde la fila 3 (índice 2)
            const jsonData = XLSX.utils.sheet_to_json(sheet, {
                header: 1, // Consideramos que la primera fila contiene las cabeceras (B2, C2... G2)
                range: 2, // Saltamos las dos primeras filas que no son de datos
            });
    
            // Verificar los datos leídos
            console.log('Datos leídos del archivo Excel:', jsonData);
    
            // Procesar los registros a partir de la fila 3 (índice 2)
            const updatedClients = jsonData.map((row) => {
                return {
                    telefono: row[0] || null,               // Columna B (Teléfono)
                    nombre: row[1] || null,                 // Columna C (Nombre)
                    placa: row[2] || null,                  // Columna D (PLACA)
                    poliza: row[3] || null,                 // Columna E (POLIZA)
                    fecha_renovacion: row[4] || null,       // Columna F (Fecha_renovacion)
                    precio: row[5] || null,                 // Columna G (Precio)
                    sucursal: null,                         // No hay sucursal en el archivo Excel
                };
            });
    
            console.log('Clientes procesados:', updatedClients);
    
            setClients(updatedClients); // Guardamos los clientes procesados
        };
        reader.readAsBinaryString(file);
    };
    
    
    const importClients = async () => {
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
    
            // Asignar el ID de sucursal por defecto si la sucursal está vacía
            let sucursalId = null; // Dado que no tenemos información de sucursal en el Excel, lo mantenemos como null
    
            // Asegurémonos de que todos los campos requeridos estén completos
            const clientData = {
                nombre: client.nombre,
                telefono: client.telefono,
                placa: client.placa,  // Asignar null o placa según corresponda
                poliza: client.poliza,
                fecha_renovacion: client.fecha_renovacion,
                precio: client.precio,
                sucursal: sucursalId,  // Usamos el valor null para la sucursal
            };
    
            // Verificamos si el cliente tiene todos los datos requeridos
            if (!clientData.nombre || !clientData.telefono || !clientData.placa || !clientData.poliza || !clientData.fecha_renovacion || !clientData.precio) {
                console.error('Faltan datos obligatorios para el cliente:', clientData);
                continue;  // Salimos al siguiente cliente si faltan datos obligatorios
            }
    
            // Enviar el cliente al backend
            try {
                const response = await fetch('http://127.0.0.1:8000/AutoMensaje/v1/clientes/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(clientData),
                });
    
                if (response.ok) {
                    console.log(`Cliente ${client.nombre} creado`);
                } else {
                    // Imprimir el error detallado para ver qué está fallando
                    const errorData = await response.json();
                    console.error('Error al importar cliente:', errorData);
                    alert(`Error al importar cliente: ${errorData.message || errorData}`);
                }
            } catch (error) {
                console.error('Error al importar cliente:', error);
                alert(`Error al importar cliente: ${error.message}`);
            }
        }
        alert('Clientes importados correctamente');
    };
    

    return (
        <div className="container mt-5">
            {/* Formulario de creación de cliente */}
            <div className="card p-4 mb-4 shadow-sm" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h3 className="text-center mb-4 text-dark">Formulario de Clientes</h3>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        createClient();
                    }}
                >
                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            name="nombre"
                            value={newClient.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Teléfono</label>
                        <input
                            type="text"
                            className="form-control"
                            name="telefono"
                            value={newClient.telefono}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Placa</label>
                        <input
                            type="text"
                            className="form-control"
                            name="placa"
                            value={newClient.placa}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Póliza</label>
                        <input
                            type="text"
                            className="form-control"
                            name="poliza"
                            value={newClient.poliza}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Fecha de Renovación</label>
                        <input
                            type="date"
                            className="form-control"
                            name="fecha_renovacion"
                            value={newClient.fecha_renovacion}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Precio</label>
                        <input
                            type="number"
                            className="form-control"
                            name="precio"
                            value={newClient.precio}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Sucursal</label>
                        <select
                            name="sucursal"
                            value={newClient.sucursal}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="">Selecciona una sucursal</option>
                            {sucursales.map((sucursal) => (
                                <option key={sucursal.id} value={sucursal.id}>
                                    {sucursal.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Crear Cliente
                    </button>
                </form>
            </div>

            {/* Importación de clientes desde archivo */}
            <div className="mb-4 text-center">
                <input type="file" onChange={handleFileUpload} />
                <button onClick={importClients} className="btn btn-success mt-3">
                    Importar Clientes
                </button>
            </div>
        </div>
    );
};

export default Home;
