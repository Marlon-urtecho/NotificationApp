import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

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

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/AutoMensaje/v1/sucursales/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          setSucursales(data);
        } else {
          console.error("Error al cargar sucursales");
        }
      } catch (error) {
        console.error("Error de red al obtener sucursales", error);
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
      const response = await fetch(
        "http://127.0.0.1:8000/AutoMensaje/v1/clientes/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newClient),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Detalles del error:", errorData);
        alert("Error al crear el cliente");
      } else {
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

      console.log("Datos leídos del archivo Excel:", jsonData);

      const updatedClients = jsonData.map((row) => {
        return {
          telefono: row[0] || null,
          nombre: row[1] || null,
          placa: row[2] || null,
          poliza: row[3] || null,
          fecha_renovacion: row[4] || null,
          precio: row[5] || null,
          sucursal: null,
        };
      });

      console.log("Clientes procesados:", updatedClients);

      setClients(updatedClients);
    };
    reader.readAsBinaryString(file);
  };

  const importClients = async () => {
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];

      let sucursalId = null;

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
        const response = await fetch(
          "http://127.0.0.1:8000/AutoMensaje/v1/clientes/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(clientData),
          },
        );

        if (response.ok) {
          console.log(`Cliente ${client.nombre} creado`);
        } else {
          const errorData = await response.json();
          console.error("Error al importar cliente:", errorData);
          alert(`Error al importar cliente: ${errorData.message || errorData}`);
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
        background: 'url("/prismaclaro.jpg") no-repeat center center fixed',
        backgroundSize: "175vh",
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "rgba(255, 255, 255, 0.5)", // Fondo más transparente para el contenedor
          borderRadius: "15px",
        }}
      >
        <h3 className="text-center mb-4 text-dark">Formulario de Clientes</h3>
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
                  backgroundColor: "rgba(255, 255, 255, 0.7)", // Fondo blanco semitransparente
                  border: "1px solid rgba(0, 0, 0, 0.2)", // Borde suave para mejorar visibilidad
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Sombra sutil
                  color: "#333", // Color del texto
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
                  backgroundColor: "rgba(255, 255, 255, 0.7)", // Fondo blanco semitransparente
                  border: "1px solid rgba(0, 0, 0, 0.2)", // Borde suave para mejorar visibilidad
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Sombra sutil
                  color: "#333", // Color del texto
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
                  backgroundColor: "rgba(255, 255, 255, 0.7)", // Fondo blanco semitransparente
                  border: "1px solid rgba(0, 0, 0, 0.2)", // Borde suave para mejorar visibilidad
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Sombra sutil
                  color: "#333", // Color del texto
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
                  backgroundColor: "rgba(255, 255, 255, 0.7)", // Fondo blanco semitransparente
                  border: "1px solid rgba(0, 0, 0, 0.2)", // Borde suave para mejorar visibilidad
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Sombra sutil
                  color: "#333", // Color del texto
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
                  backgroundColor: "rgba(255, 255, 255, 0.7)", // Fondo blanco semitransparente
                  border: "1px solid rgba(0, 0, 0, 0.2)", // Borde suave para mejorar visibilidad
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Sombra sutil
                  color: "#333", // Color del texto
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
                  backgroundColor: "rgba(255, 255, 255, 0.7)", // Fondo blanco semitransparente
                  border: "1px solid rgba(0, 0, 0, 0.2)", // Borde suave para mejorar visibilidad
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Sombra sutil
                  color: "#333", // Color del texto
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
                  backgroundColor: "rgba(255, 255, 255, 0.7)", // Fondo blanco semitransparente
                  border: "1px solid rgba(0, 0, 0, 0.2)", // Borde suave para mejorar visibilidad
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Sombra sutil
                  color: "#333", // Color del texto
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
