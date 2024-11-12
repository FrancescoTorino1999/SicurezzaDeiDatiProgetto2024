// src/components/Footer/Footer.js
import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} ethBet Marketplace - Tutti i diritti riservati</p>
        <nav className="footer-nav">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Termini e Condizioni</a>
          <a href="#contact">Contattaci</a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
