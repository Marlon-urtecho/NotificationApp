import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

function Home() {
  const [newClient, setNewClient] = useState({
    nombre: "",
    telefono: "",
    placa: "",
    poliza: "",
    fecha_renovacion: "",
    precio: "",
    sucursal: "",
  });

  const [clients, setClients] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true); //Estado de carga
  const [error, setError] = useState(""); //Estado para mensajes de error

  // Asegurarse de que el token esté presente
  if (!token) {
    console.error("No estás autenticado. Inicia sesión para continuar.");
  }

  const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/AutoMensaje/v1/",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchSucursales = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // Si no hay token, redirigir al login
        setError("No estás autenticado. Por favor, inicia sesión.");
        setLoading(false);
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

        console.log("Respuesta de sucursales:", response.data);

        if (Array.isArray(response.data)) {
          setSucursales(response.data); // Actualizar el estado con las sucursales
          setLoading(false); // Cambiar el estado de carga a falso
        } else {
          throw new Error(
            "Error: las sucursales no están en el formato esperado",
          );
        }
      } catch (error) {
        setError("Error al cargar las sucursales: " + error.message);
        setLoading(false); // Cambiar el estado de carga a falso
      }
    };

    fetchSucursales();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewClient({
      ...newClient,
      [name]: value,
    });
  };

  const createClient = async () => {
    try {
      const response = await axiosInstance.post("clientes/", newClient);

      if (response.status === 201) {
        alert("Nuevo cliente creado");
        setNewClient({
          nombre: "",
          telefono: "",
          placa: "",
          poliza: "",
          fecha_renovacion: "",
          precio: "",
          sucursal: "",
        });
      } else {
        console.error("Detalles del error:", response.data);
        alert("Error al crear el cliente");
      }
    } catch (error) {
      console.error("Error al crear el cliente:", error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        range: 2,
      });

      const updatedClients = jsonData.map((row) => {
        return {
          telefono: row[0] || null,
          nombre: row[1] || null,
          placa: row[2] || null,
          poliza: row[3] || null,
          fecha_renovacion: row[4] || null,
          precio: row[5] || null,
          sucursal: null, // Asignar la sucursal después si es necesario
        };
      });

      setClients(updatedClients);
    };
    reader.readAsBinaryString(file);
  };

  const importClients = async () => {
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];

      let sucursalId = client.sucursal || null; // Asigna una sucursal válida aquí

      const clientData = {
        nombre: client.nombre,
        telefono: client.telefono,
        placa: client.placa,
        poliza: client.poliza,
        fecha_renovacion: client.fecha_renovacion,
        precio: client.precio,
        sucursal: sucursalId,
      };

      if (
        !clientData.nombre ||
        !clientData.telefono ||
        !clientData.placa ||
        !clientData.poliza ||
        !clientData.fecha_renovacion ||
        !clientData.precio
      ) {
        console.error("Faltan datos obligatorios para el cliente:", clientData);
        continue;
      }

      try {
        const response = await axiosInstance.post("clientes/", clientData);

        if (response.status === 201) {
          console.log(`Cliente ${client.nombre} creado`);
        } else {
          console.error("Error al importar cliente:", response.data);
          alert(
            `Error al importar cliente: ${response.data.message || response.data}`,
          );
        }
      } catch (error) {
        console.error("Error al importar cliente:", error);
        alert(`Error al importar cliente: ${error.message}`);
      }
    }
    alert("Clientes importados correctamente");
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{
        height: "90vh",
        backgroundColor: "#fff",
        backgroundSize: "175vh",
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#1f2072",
          borderRadius: "15px",
          color: "#fff",
        }}
      >
        <h3 className="text-center mb-4 text-white">Formulario de Clientes</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createClient();
          }}
        >
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                value={newClient.nombre}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  color: "#333",
                }}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-control"
                name="telefono"
                value={newClient.telefono}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  color: "#333",
                }}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Placa</label>
              <input
                type="text"
                className="form-control"
                name="placa"
                value={newClient.placa}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  color: "#333",
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Póliza</label>
              <input
                type="text"
                className="form-control"
                name="poliza"
                value={newClient.poliza}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  color: "#333",
                }}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Fecha de Renovación</label>
              <input
                type="date"
                className="form-control"
                name="fecha_renovacion"
                value={newClient.fecha_renovacion}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  color: "#333",
                }}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Precio</label>
              <input
                type="number"
                className="form-control"
                name="precio"
                value={newClient.precio}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  color: "#333",
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label">Sucursal</label>
              <select
                name="sucursal"
                value={newClient.sucursal}
                onChange={handleChange}
                className="form-control"
                required
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  color: "#333",
                }}
              >
                <option value="">Selecciona una sucursal</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Crear Cliente
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
