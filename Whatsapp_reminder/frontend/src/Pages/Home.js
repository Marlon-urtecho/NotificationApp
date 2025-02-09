import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Necesitarás instalar la librería `xlsx` para leer archivos Excel
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
  const [newClient, setNewClient] = useState({
    nombre: '',
    telefono: '',
    placa: '',
    poliza: '',
    fechaRenovacion: '',
    precio: '',
    sucursal: '', // Ahora la sucursal es un ID que se seleccionará del combo box
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
    if (newClient.precio <= 0) {
      alert('El precio debe ser un número positivo.');
      return;
    }

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
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

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
      const updatedClients = jsonData.map(([telefono, nombre, placa, poliza, fechaRenovacion, precio]) => ({
        telefono: telefono || null,
        nombre: nombre || null,
        placa: placa || null,
        poliza: poliza || null,
        fechaRenovacion: fechaRenovacion || null,
        precio: precio || null,
        sucursal: null, // No hay sucursal en el archivo Excel
      }));

      console.log('Clientes procesados:', updatedClients);

      setClients(updatedClients); // Guardamos los clientes procesados
    };
    reader.readAsArrayBuffer(file); // Eliminamos la lectura binaria extra
  };

  const importClients = async () => {
    // Lista para registrar los fallos en la importación
    const failedImports = [];

    const promises = clients.map(async (client) => {
      if (!client.nombre || !client.telefono || !client.placa || !client.poliza || !client.fecha_renovacion || !client.precio) {
        failedImports.push(client);  // Agregar cliente a lista de errores
        return;
      }

      // Asignar el ID de sucursal por defecto si la sucursal está vacía
      const sucursalId = null; // Dado que no tenemos información de sucursal en el Excel, lo mantenemos como null

      const clientData = {
        nombre: client.nombre,
        telefono: client.telefono,
        placa: client.placa,
        poliza: client.poliza,
        fechaRenovacion: client.fechaRenovacion,
        precio: client.precio,
        sucursal: sucursalId,
      };

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
          const errorData = await response.json();
          console.error('Error al importar cliente:', errorData);
          alert(`Error al importar cliente: ${errorData.message || errorData}`);
        }
      } catch (error) {
        console.error('Error al importar cliente:', error);
        alert(`Error al importar cliente: ${error.message}`);
      }
    });

    await Promise.all(promises);

    if (failedImports.length > 0) {
      console.error(`Hubo errores al importar los siguientes clientes: ${failedImports.map((c) => c.nombre).join(', ')}`);
    } else {
      alert('Clientes importados correctamente');
    }
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
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              name="nombre"
              value={newClient.nombre}
              onChange={handleChange}
              required
              id="nombre"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="telefono" className="form-label">Teléfono</label>
            <input
              type="text"
              className="form-control"
              name="telefono"
              value={newClient.telefono}
              onChange={handleChange}
              required
              id="telefono"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="placa" className="form-label">Placa</label>
            <input
              type="text"
              className="form-control"
              name="placa"
              value={newClient.placa}
              onChange={handleChange}
              required
              id="placa"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="poliza" className="form-label">Póliza</label>
            <input
              type="text"
              className="form-control"
              name="poliza"
              value={newClient.poliza}
              onChange={handleChange}
              required
              id="poliza"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="fecha_renovacion" className="form-label">Fecha de Renovación</label>
            <input
              type="date"
              className="form-control"
              name="fecha_renovacion"
              value={newClient.fecha_renovacion}
              onChange={handleChange}
              required
              id="fecha_renovacion"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="precio" className="form-label">Precio</label>
            <input
              type="number"
              className="form-control"
              name="precio"
              value={newClient.precio}
              onChange={handleChange}
              required
              id="precio"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="sucursal" className="form-label">Sucursal</label>
            <select
              name="sucursal"
              value={newClient.sucursal}
              onChange={handleChange}
              className="form-control"
              required
              id="sucursal"
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

      {/* Formulario de importación */}
      <div className="card p-4 mb-4 shadow-sm" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h3 className="text-center mb-4">Importar Clientes desde Excel</h3>
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          className="form-control mb-3"
        />
        <button
          type="button"
          className="btn btn-success mt-3"
          onClick={importClients}
        >
          Importar Clientes
        </button>
      </div>
    </div>
  );
}
export default Home;
