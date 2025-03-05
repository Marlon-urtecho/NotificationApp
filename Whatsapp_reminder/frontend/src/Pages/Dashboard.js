import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Dashboard = () => {
  const [clients, setClients] = useState([]); // Lista de clientes
  const [data, setData] = useState([]); // Datos para el gráfico
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Mes por defecto (actual)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Año por defecto (actual)
  const [months] = useState([
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]);
  const [years, setYears] = useState([]); // Para guardar los años disponibles
  const [error, setError] = useState(null); // Para mostrar errores

  const token = localStorage.getItem("token"); // Obtener el token desde localStorage

  // Asegurarse de que el token está presente
  if (!token) {
    setError("No estás autenticado. Inicia sesión para continuar.");
  }

  // Configuración de Axios con el token
  const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/AutoMensaje/v1/",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Enviar el token en las cabeceras
    },
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axiosInstance.get("clientes/");
        setClients(response.data); // Guardamos los clientes obtenidos
        generateChartData(response.data, selectedMonth, selectedYear); // Generamos los datos para el gráfico
        generateYears(response.data); // Generamos los años disponibles
      } catch (error) {
        console.error("Error de red al obtener clientes", error);
        setError("Hubo un problema al cargar los clientes. Intenta de nuevo.");
      }
    };

    if (token) {
      fetchClients();
    }
  }, [selectedMonth, selectedYear, token]); // Ejecutamos cuando se cambia el mes o el año o el token

  // Genera los años disponibles a partir de los clientes
  const generateYears = (clients) => {
    const years = [
      ...new Set(
        clients.map((client) =>
          new Date(client.fecha_renovacion).getFullYear(),
        ),
      ),
    ];
    setYears(years);
  };

  // Genera los datos para el gráfico a partir de los clientes
  const generateChartData = (clients, month, year) => {
    const dayCount = {}; // Objeto para contar clientes por día
    const clientsByDay = {}; // Objeto para almacenar los clientes por día

    clients.forEach((client) => {
      const date = new Date(client.fecha_renovacion);
      const clientYear = date.getFullYear();
      const clientMonth = date.getMonth();
      const clientDay = date.getDate();

      // Verificar si el año y mes coinciden con la selección
      if (clientYear === year && clientMonth === month) {
        const dayKey = `${clientDay}`;
        if (dayCount[dayKey]) {
          dayCount[dayKey] += 1;
        } else {
          dayCount[dayKey] = 1;
        }

        // Almacenar los clientes por día
        if (!clientsByDay[dayKey]) {
          clientsByDay[dayKey] = [];
        }
        clientsByDay[dayKey].push(client);
      }
    });

    // Crear los datos para el gráfico
    const chartData = Object.keys(dayCount).map((key) => ({
      day: key,
      count: dayCount[key],
      clients: clientsByDay[key], // Incluir los clientes de ese día
    }));

    setData(chartData); // Guardamos los datos para el gráfico
  };

  // Manejar cambios en los selectores de mes y año
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Dashboard de Clientes Registrados</h2>

      <div className="d-flex justify-content-center my-4">
        <div className="me-3">
          <label>Mes: </label>
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="form-select"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Año: </label>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="form-select"
          >
            {years.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Lista de clientes */}
      <div className="mt-5">
        <h3>Clientes Registrados</h3>
        {data.length > 0 && (
          <div className="row">
            {data.map((dayData) => (
              <div key={dayData.day} className="col-12 col-md-4 mb-4">
                <h4>Dia {dayData.day}</h4>
                <ul className="list-group">
                  {dayData.clients.map((client, index) => (
                    <li key={index} className="list-group-item">
                      <strong>{client.nombre}</strong> - {client.telefono} -{" "}
                      {client.placa}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
