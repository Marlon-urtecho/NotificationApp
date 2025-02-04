import React, { useEffect, useState } from 'react';
import { Alert, Card, Spinner, Table, Form, InputGroup } from 'react-bootstrap';

const Recordatorios = () => {
    const [recordatorios, setRecordatorios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filteredRecordatorios, setFilteredRecordatorios] = useState([]);

    // Función para obtener los recordatorios desde el backend
    useEffect(() => {
        fetch('http://localhost:8000/AutoMensaje/v1/api/recordatorios/')
            .then(response => response.json())
            .then(data => {
                setRecordatorios(data.recordatorios);
                setLoading(false);
            })
            .catch(error => {
                console.error('Hubo un error al obtener los recordatorios:', error);
                setError('Hubo un problema al cargar los recordatorios.');
                setLoading(false);
            });
    }, []);

    // Función de búsqueda
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        
        if (value) {
            const filtered = recordatorios.filter(recordatorio =>
                recordatorio.cliente_nombre.toLowerCase().includes(value.toLowerCase()) ||
                recordatorio.mensaje.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredRecordatorios(filtered);
        } else {
            setFilteredRecordatorios(recordatorios);
        }
    };

    // Filtrar recordatorios según búsqueda
    useEffect(() => {
        setFilteredRecordatorios(recordatorios);
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
                                            <td>{new Date(recordatorio.fecha_envio).toLocaleString()}</td>
                                            <td>{recordatorio.enviado ? 'Sí' : 'No'}</td>
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
