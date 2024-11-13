import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import "./Login.css";

function Login({ setUser }) { // Ricevi setUser come prop per aggiornare lo stato utente
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Usa useNavigate per reindirizzare

  // Funzione per gestire il submit del form di login
  const handleLogin = async () => {
    try {
      // Invia richiesta al server per autenticazione
      const response = await axios.post('http://localhost:8100/auth/login', {
        username,
        password
      });

      // Se la risposta ha successo, salva il token JWT
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Aggiorna lo stato utente con l'indirizzo (username in questo caso)
        setUser({ address: username });

        // Reindirizza alla pagina home
        navigate('/home');
      }
    } catch (err) {
      setError('Credenziali non valide');
      console.error('Errore di autenticazione:', err);
    }
  };

  return (
    <div className='box-login-container'>
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="user-box">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Username</label>
          </div>
          <div className="user-box">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>
          <button
            style={{ width: "100%" }}
            type="button"
            onClick={handleLogin}
          >
            Login
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
