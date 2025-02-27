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
            alt="Logo"
            style={{ height: "50px", marginRight: "10px" }}
          />
          | Seguros Notification
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                <img
                  src="/settings.png"
                  alt="Logo"
                  style={{ height: "50px", marginRight: "0px" }}
                />
                settings
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>Inicio</DropdownItem>
                <DropdownItem>option 2</DropdownItem>
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
