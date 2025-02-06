import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.scss';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Clients from './Pages/Clients';
import Dashboard from './Pages/Dashboard';
import Home from './Pages/Home';
import Recordatorios from './Pages/Recordatorios';
import Sucursales from './Pages/Sucursales';
import Users from './Pages/Users';

function App() {
  return (
    <Router>
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
            {' '}
            {/* Dashboard */}
            <Route path="/Recordatorios" element={<Recordatorios />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
