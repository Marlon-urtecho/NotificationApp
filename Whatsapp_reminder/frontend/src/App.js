import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [recordatoriosPendientes, setRecordatoriosPendientes] = useState([]);
  const [recordatoriosEnviados, setRecordatoriosEnviados] = useState([]);

  useEffect(() => {
    // Hacer una solicitud a la API de Django para obtener los recordatorios
    fetch('http://localhost:8000/api/recordatorios/')  // Asegúrate de que esta URL sea correcta
      .then(response => response.json())
      .then(data => {
        const pendientes = data.recordatorios.filter(recordatorio => !recordatorio.enviado);
        const enviados = data.recordatorios.filter(recordatorio => recordatorio.enviado);

        setRecordatoriosPendientes(pendientes);
        setRecordatoriosEnviados(enviados);
      })
      .catch(error => console.error('Error al obtener los datos:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Recordatorios Pendientes</h1>
        <ul>
          {recordatoriosPendientes.length > 0 ? (
            recordatoriosPendientes.map((recordatorio, index) => (
              <li key={index}>
                Cliente: {recordatorio.cliente.nombre}<br />
                Mensaje: {recordatorio.mensaje}<br />
                Fecha de Envío: {recordatorio.fecha_envio}
              </li>
            ))
          ) : (
            <p>No hay recordatorios pendientes.</p>
          )}
        </ul>

        <h1>Recordatorios Enviados</h1>
        <ul>
          {recordatoriosEnviados.length > 0 ? (
            recordatoriosEnviados.map((recordatorio, index) => (
              <li key={index}>
                Cliente: {recordatorio.cliente.nombre}<br />
                Mensaje: {recordatorio.mensaje}<br />
                Fecha de Envío: {recordatorio.fecha_envio}<br />
                Estado: {recordatorio.enviado ? 'Enviado' : 'Pendiente'}
              </li>
            ))
          ) : (
            <p>No hay recordatorios enviados.</p>
          )}
        </ul>
      </header>
    </div>
  );
}

export default App;
