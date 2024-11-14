import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./CertificateDetail.css";
import { Link } from 'react-router-dom';

function CertificateDetail({user}) {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    // Recupera il certificato specifico tramite l'ID
    const fetchCertificate = async () => {
      try {
        const response = await fetch(`http://localhost:8100/api/certificates/${id}`);
        const data = await response.json();
        setCertificate(data);
      } catch (error) {
        console.error("Errore nel recuperare il certificato:", error);
      }
    };

    fetchCertificate();
  }, [id]);



  const [expirationBet, setExpirationBet] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Calcola la differenza in millisecondi
      const difference = new Date(certificate.expiringBetDate) - new Date();
      
      if (difference > 0) {
        // Calcolo di giorni, ore, minuti e secondi in base ai millisecondi
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setExpirationBet(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        clearInterval(intervalId);
        setExpirationBet("0d 0h 0m 0s"); // Tempo scaduto
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [certificate]);


  if (!certificate) return <p>Caricamento...</p>;

  return (
    <div className="certificate-detail">
      <div className='certificate-card'>
        <h2>Dettaglio Certificato</h2>
        <p><strong>ID Certificato:</strong> {certificate._id}</p>
        <p><strong>CA Emittente:</strong> {certificate.certificateAuthority}</p>
        <p><strong>Status:</strong> {certificate.status}</p>
        <p><strong>Data Inizio:</strong>
        {
          new Date(certificate.createdAt).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}{" "}
          {
            new Date(certificate.expiryDate).toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })}
        </p>
        <p><strong>Data Fine:</strong>  
        {
          new Date(certificate.expiryDate).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}{" "}
          {
            new Date(certificate.expiryDate).toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })}
        </p>
        <p><strong>Prezzo BET:</strong>{certificate.price} Wei</p>
        {user ? (
          <>
            <p><strong>Expiration bet in:</strong> {expirationBet} </p>
            <p><strong>Actual betters:</strong>{certificate.betters === " " ? " No one has bet yet" : certificate.betters}</p>
          </>
        ) : (
          <Link className = "button" to="/login">Login to see more informarions</Link>
        )}
      </div>
      {user ? (
          <>
            <button style={{ marginTop: "30px" }}>Try to BET</button>
          </>
        ) : (
          <Link style={{ marginTop: "30px" }} className = "button" to="/login">Login</Link>
        )}
      
    </div>
  );
}

export default CertificateDetail;
