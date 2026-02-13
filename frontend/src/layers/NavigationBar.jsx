import { useState, useEffect } from 'react';
import { Navbar as BSNavbar, Nav, Container, Form } from 'react-bootstrap'; 
import { Link } from 'react-router-dom';
import { useTheme } from "../../theme/ThemeContext.jsx";


import logo from "../../assets/images/medcard_logo.png";
import "../../styles/NavigationBar.css";

const NavigationBar = () => {
  // Now useTheme will work because it is imported above
  const { theme, toggleTheme } = useTheme(); 
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <BSNavbar 
      className="custom-navbar" 
      expand="lg" 
      fixed="top"
    >
      <Container>
        <BSNavbar.Brand
          as={Link}
          to="/admin"
          className="navbar-brand d-flex align-items-center"
        >
          <img src={logo} alt="Medcard" className="logo" style={{ height: '40px' }} />
        </BSNavbar.Brand>

        <BSNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          className="border-0 p-2"
          style={{ background: 'rgba(16, 185, 129, 0.1)' }}
        />
        
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" className="nav-link me-3">Home</Nav.Link>
            <Nav.Link as={Link} to="/about" className="nav-link me-3">About</Nav.Link>
            <Nav.Link as={Link} to="/services" className="nav-link me-3">Services</Nav.Link>
            <Nav.Link as={Link} to="/subscription_plans" className="nav-link me-3">Subscription Plans</Nav.Link>
            
            <div className="d-flex flex-column flex-lg-row gap-2 align-items-center">
              <Nav.Link
                as={Link}
                to="/provider_signup"
                className="nav-login-btn provider-btn d-flex align-items-center justify-content-center"
              >
                Provider Register
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/subscriber_signup"
                className="nav-login-btn subscriber-btn d-flex align-items-center justify-content-center"
              >
                Subscriber Register
              </Nav.Link>
              
              <div 
                className="ms-lg-3 mt-2 mt-lg-0 theme-icon-toggle" 
                onClick={toggleTheme} 
                style={{ cursor: 'pointer', fontSize: '1.5rem', userSelect: 'none' }}
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <i className="bi bi-sun-fill"></i> : <i className="bi bi-moon-fill"></i>}
              </div>
            </div>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default NavigationBar;
