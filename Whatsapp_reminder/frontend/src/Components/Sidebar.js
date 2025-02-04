import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUsers, FaBuilding, FaUser, FaChartLine } from 'react-icons/fa';

const Sidebar = () => {
    return (
        <div className="sidebar bg-blue">
            <ul>
                <li>
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => 
                            `${isActive ? 'active' : ''} text-light rounded py-2 w-100 d-inline-block px-3`
                        }
                    >
                        <FaHome className="me-2" /> Home
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/clients" 
                        className={({ isActive }) => 
                            `${isActive ? 'active' : ''} text-light rounded py-2 w-100 d-inline-block px-3`
                        }
                    >
                        <FaUsers className="me-2" /> Clientes
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/sucursales" 
                        className={({ isActive }) => 
                            `${isActive ? 'active' : ''} text-light rounded py-2 w-100 d-inline-block px-3`
                        }
                    >
                        <FaBuilding className="me-2" /> Sucursales
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/users" 
                        className={({ isActive }) => 
                            `${isActive ? 'active' : ''} text-light rounded py-2 w-100 d-inline-block px-3`
                        }
                    >
                        <FaUser className="me-2" /> Usuario
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/dashboard" 
                        className={({ isActive }) => 
                            `${isActive ? 'active' : ''} text-light rounded py-2 w-100 d-inline-block px-3`
                        }
                    >
                        <FaChartLine className="me-2" /> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/Recordatorios" 
                        className={({ isActive }) => 
                            `${isActive ? 'active' : ''} text-light rounded py-2 w-100 d-inline-block px-3`
                        }
                    >
                        <FaChartLine className="me-2" /> Recordatorios
                    </NavLink>
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;
