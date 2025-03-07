import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";
import Home from "./Pages/Home";
import Clients from "./Pages/Clients";
import Dashboard from "./Pages/Dashboard";
import Recordatorios from "./Pages/Recordatorios";
import Sucursales from "./Pages/Sucursales";
import Users from "./Pages/Users";
import ImportarClientes from "./Pages/ImportarClientes";
import Login from "./Pages/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Comprobamos si hay un token en localStorage al montar el componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true); // Si el token existe, el usuario está autenticado
    }
  }, []);

  return (
    <Router>
      <div className="app">
        {/* Solo mostramos el Navbar y Sidebar si el usuario está autenticado */}
        {isAuthenticated && (
          <>
            <Navbar />
            <div className="flex">
              <Sidebar />
              <div className="content w-100">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/sucursales" element={<Sucursales />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route
                    path="/ImportarClientes"
                    element={<ImportarClientes />}
                  />
                  <Route path="/Recordatorios" element={<Recordatorios />} />
                </Routes>
              </div>
            </div>
          </>
        )}

        {/* Si no está autenticado, solo mostramos el login */}
        {!isAuthenticated && (
          <Routes>
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
