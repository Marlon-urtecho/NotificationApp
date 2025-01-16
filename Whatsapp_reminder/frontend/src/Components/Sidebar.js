import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <ul>
                <li>
                    <Link to="/">Inicio</Link>
                </li>
                <li>
                    <Link to="/clientes">Clientes</Link>
                </li>
                <li>
                    <Link to="/sucursales">Sucursales</Link>
                </li>
                <li>
                    <Link to="/usuario">Usuario</Link>
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;