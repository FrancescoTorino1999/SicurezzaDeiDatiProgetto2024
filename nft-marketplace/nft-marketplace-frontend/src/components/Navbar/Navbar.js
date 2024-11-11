import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
      <div className='navbar-div'>
        <nav className="navbar">
          <div className="navbar-logo"><img alt="Logo" width="50px" src="../images/logo.png"/></div>
          <ul className="navbar-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link className = "button" to="/login">Login</Link>
            </li>
          </ul>
        </nav>
        <div className="banner-logo"><img alt="banner" src="../images/banner.png"/></div>
      </div>
  );
}

export default Navbar;
