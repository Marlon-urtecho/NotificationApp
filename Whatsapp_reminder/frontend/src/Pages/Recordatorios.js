import React, { useEffect, useState } from "react";
import { Alert, Card, Spinner, Table, Form, InputGroup } from "react-bootstrap";

const Recordatorios = () => {
  const [recordatorios, setRecordatorios] = useState([]); // Inicializar como un array vacío
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredRecordatorios, setFilteredRecordatorios] = useState([]); // Inicializar como un array vacío

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRecordatorios = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/AutoMensaje/v1/api/recordatorios/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json(); // Captura el mensaje de error
          console.error("Error del backend:", errorData);
          throw new Error("Error al obtener los recordatorios");
        }

        const data = await response.json();
        setRecordatorios(data.recordatorios || []);
        setLoading(false);
      } catch (error) {
        console.error("Hubo un error al obtener los recordatorios:", error);
        setError("Hubo un problema al cargar los recordatorios.");
        setLoading(false);
      }
    };

    fetchRecordatorios();
  }, [token]); // Dependemos del token para que se vuelva a cargar si cambia

  // Función de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value) {
      const filtered = (recordatorios || []).filter(
        (recordatorio) =>
          recordatorio.cliente_nombre
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          recordatorio.mensaje.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredRecordatorios(filtered);
    } else {
      setFilteredRecordatorios(recordatorios);
    }
  };

  // Filtrar recordatorios según búsqueda
  useEffect(() => {
    setFilteredRecordatorios(recordatorios || []); // Asegúrate de que nunca sea undefined
  }, [recordatorios]);

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
              onChange={handleSearchChange}
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
            {filteredRecordatorios && filteredRecordatorios.length === 0 ? (
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
