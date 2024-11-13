import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import {  useNavigate } from 'react-router-dom';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  // Funzione di logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Rimuovi il token
    setUser(null); // Resetta lo stato utente
    navigate('/login'); // Reindirizza alla pagina di login
  };
  return (
      <div className='navbar-div'>
        <nav className="navbar">
          <div className="navbar-logo"><img alt="Logo" width="50px" src="../images/logo.png"/></div>
          <ul className="navbar-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
                {user ? (
                  <>
                    <span>Utente: {user.address}</span>
                    <button onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <Link className = "button" to="/login">Login</Link>
                )}
              
            </li>
          </ul>
        </nav>
        <div className="banner-logo"><img alt="banner" src="../images/banner.png"/></div>
      </div>
  );
}

export default Navbar;
