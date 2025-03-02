import React, { useEffect, useState } from "react";
import { Alert, Card, Form, InputGroup, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Importa el hook useNavigate de react-router
import axios from "../Api/Axios"; // Importa la instancia de Axios configurada

const Recordatorios = () => {
  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredRecordatorios, setFilteredRecordatorios] = useState([]);

  const navigate = useNavigate(); // Inicializa el hook de navegación

  useEffect(() => {
    // Verificar si el token está en el localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      // Si no hay token, redirigir al login
      setError("No estás autenticado. Por favor, inicia sesión.");
      setLoading(false);
      navigate("/login"); // Usamos el hook de navegación para redirigir
      return;
    }

    // Si el token está presente, intentamos obtener los recordatorios
    const fetchRecordatorios = async () => {
      try {
        const response = await axios.get("/AutoMensaje/v1/api/recordatorios/");
        setRecordatorios(response.data.recordatorios || []);
        setLoading(false);
      } catch (error) {
        console.error("Hubo un error al obtener los recordatorios:", error);
        if (error.response && error.response.status === 401) {
          setError(
            "El token ha expirado o es inválido. Redirigiendo al login...",
          );
          setTimeout(() => {
            navigate("/login"); // Redirige al login con un pequeño retraso
          }, 2000);
        } else {
          setError("Hubo un problema al cargar los recordatorios.");
        }
        setLoading(false);
      }
    };

    fetchRecordatorios();
  }, [navigate]); // Agregamos `navigate` como dependencia para evitar advertencias

  // Lógica de filtrado y búsqueda
  useEffect(() => {
    if (search === "") {
      setFilteredRecordatorios(recordatorios);
    } else {
      setFilteredRecordatorios(
        recordatorios.filter(
          (recordatorio) =>
            recordatorio.cliente_nombre
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            recordatorio.mensaje.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, recordatorios]);

  return (
    <div className="container mt-5">
      <Card className="mb-4">
        <Card.Header as="h5">Lista de Recordatorios</Card.Header>
        <Card.Body>
          {/* Mensaje de éxito o error */}
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Barra de búsqueda */}
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              placeholder="Buscar por cliente o mensaje..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Tabla de recordatorios */}
      <div className="mt-4">
        {loading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {filteredRecordatorios.length === 0 ? (
              <Alert variant="info">No hay recordatorios disponibles.</Alert>
            ) : (
              <Table striped bordered hover responsive className="shadow-sm">
                <thead className="thead-light">
                  <tr>
                    <th>Cliente</th>
                    <th>Teléfono</th>
                    <th>Mensaje</th>
                    <th>Fecha de Envío</th>
                    <th>Enviado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecordatorios.map((recordatorio, index) => (
                    <tr key={index}>
                      <td>{recordatorio.cliente_nombre}</td>
                      <td>{recordatorio.cliente_telefono}</td>
                      <td>{recordatorio.mensaje}</td>
                      <td>
                        {new Date(recordatorio.fecha_envio).toLocaleString()}
                      </td>
                      <td>{recordatorio.enviado ? "Sí" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Recordatorios;
