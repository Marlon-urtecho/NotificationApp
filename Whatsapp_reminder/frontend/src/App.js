import React, { useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
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

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <div className="content w-100">
          <Routes>
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />
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
              path="/recordatorios"
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
