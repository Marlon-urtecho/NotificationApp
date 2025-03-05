import React, { useState, useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import axios from "./Api/Axios"; // Asegúrate de tener la instancia de Axios configurada
import "./App.scss";
import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";
import Clients from "./Pages/Clients";
import Dashboard from "./Pages/Dashboard";
import Home from "./Pages/Home";
import Recordatorios from "./Pages/Recordatorios";
import Sucursales from "./Pages/Sucursales";
import Users from "./Pages/Users";
import ImportarClientes from "./Pages/ImportarClientes";
import Login from "./Pages/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Este useEffect se ejecutará una sola vez al inicio de la aplicación
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Solo actualizamos el estado si realmente hay un token
      axios.defaults.headers["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true); // Establecemos la autenticación solo si tenemos el token
    }
  }, []); // Este efecto se ejecuta solo una vez, cuando el componente se monta

  // Evitamos usar un estado en el render que cambie el valor repetidamente y cause bucles infinitos.
  // El estado isAuthenticated debería cambiar solo si es necesario.

  return (
    <Router>
      {/* Si está autenticado, mostramos el Navbar */}
      {isAuthenticated && <Navbar />}
      <div className="flex">
        {/* Si está autenticado, mostramos el Sidebar */}
        {isAuthenticated && <Sidebar />}
        <div className="content w-100">
          <Routes>
            {/* Ruta para login, siempre accesible */}
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />

            {/* Las rutas de la aplicación solo se mostrarán si el usuario está autenticado */}
            <Route
              path="/"
              element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/clients"
              element={isAuthenticated ? <Clients /> : <Navigate to="/login" />}
            />
            <Route
              path="/sucursales"
              element={
                isAuthenticated ? <Sucursales /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/users"
              element={isAuthenticated ? <Users /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/ImportarClientes"
              element={
                isAuthenticated ? (
                  <ImportarClientes />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/Recordatorios"
              element={
                isAuthenticated ? <Recordatorios /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
