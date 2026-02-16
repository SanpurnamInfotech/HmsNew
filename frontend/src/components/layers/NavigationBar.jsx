import React from 'react';
import { Navbar, Nav, Container, Form } from 'react-bootstrap';
import "../../styles/NavigationBar.css";
import { useTheme } from "../../theme/ThemeContext.jsx";

const NavigationBar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Navbar collapseOnSelect expand="lg" className="custom-navbar shadow-sm sticky-top">
      <Container fluid>
        <Navbar.Brand href="/admin" className="fw-bold fs-3">HMS</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="#features">Features</Nav.Link>
            <Nav.Link href="#pricing">Pricing</Nav.Link>
            <div className="ms-lg-3 mt-3 mt-lg-0">
              <Form.Check 
                type="switch"
                id="theme-switch"
                label={theme === "dark" ? "🌙" : "☀️"}
                checked={theme === "dark"}
                onChange={toggleTheme}
                className="theme-toggle"
              />
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
