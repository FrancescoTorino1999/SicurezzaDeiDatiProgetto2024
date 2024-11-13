import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import {  useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

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
                    <div className = "account-icon" onClick={toggleVisibility}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="#FFF" width="40px" height="40px" viewBox="0 0 512 512"><title>ionicons-v5-j</title><path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48Zm2,96a72,72,0,1,1-72,72A72,72,0,0,1,258,144Zm-2,288a175.55,175.55,0,0,1-129.18-56.6C135.66,329.62,215.06,320,256,320s120.34,9.62,129.18,55.39A175.52,175.52,0,0,1,256,432Z"/></svg>
                    </div>
                    <div id="user-info" className={isVisible ? "user-info" : "user-info hidden"}>
                      <strong>Utente: {user.address}</strong>
                      <button onClick={handleLogout}>Logout</button>
                    </div>
                    
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
