import React, { useState } from "react";
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  UncontrolledDropdown,
} from "reactstrap";
import "../App.scss";

function NavbarNav(args) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <Navbar color="blue" light expand="lg">
      <div className="container-fluid">
        <NavbarBrand href="#">
          <img
            src="/logotaipo.png"
            alt="Logo-Aplicacion"
            style={{ height: "50px", marginRight: "10px" }}
          />
          | WhatsReminder
        </NavbarBrand>
        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                <img
                  src="/settings.png"
                  alt="Logo"
                  style={{ height: "50px", marginRight: "0px", color: "white" }}
                />
                Opciones
              </DropdownToggle>
              <DropdownMenu align="end">
                <DropdownItem>Home</DropdownItem>
                <DropdownItem>Clientes</DropdownItem>
                <DropdownItem>Sucursales</DropdownItem>
                <DropdownItem>Usuarios</DropdownItem>
                <DropdownItem>Dashboard</DropdownItem>
                <DropdownItem divider />
                <DropdownItem>Cerrar Sesión</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
      </div>
    </Navbar>
  );
}

export default NavbarNav;
