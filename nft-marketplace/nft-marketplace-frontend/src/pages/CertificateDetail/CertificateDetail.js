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

  const [price, setPrice] = useState(null);

  useEffect(() => {
    // Genera un numero casuale tra 1000 e 2000 euro, multiplo di 100
    const generateEuroPrice = () => {
      const min = 10; // 1000 / 100
      const max = 20; // 2000 / 100
      const randomMultiplier = Math.floor(Math.random() * (max - min + 1)) + min;
      return randomMultiplier * 100;
    };

    // Converte il prezzo da euro a Gwei
    const convertEuroToGwei = (euroPrice) => {
      const ethPrice = euroPrice * 55279.16; // Converte da euro a ETH
      return ethPrice; // Converte da ETH a Gwei
    };

    // Calcola e imposta il prezzo iniziale in Gwei
    const euroPrice = generateEuroPrice();
    const gweiPrice = convertEuroToGwei(euroPrice);
    setPrice(gweiPrice);
  }, [id]); 

  if (!certificate) return <p>Caricamento...</p>;

  return (
    <div className="certificate-detail">
      <div className='certificate-card'>
        <h2>Dettaglio Certificato</h2>
        <p><strong>ID Certificato:</strong> {certificate._id}</p>
        <p><strong>Codice Certificato:</strong> {certificate.certificateCode}</p>
        <p><strong>CA Emittente:</strong> {certificate.certificateAuthority}</p>
        <p><strong>Status:</strong> {certificate.status}</p>
        <p><strong>Data Inizio:</strong> {certificate.startDate}</p>
        <p><strong>Data Fine:</strong> {certificate.endDate}</p>
        <p><strong>Prezzo BET:</strong>{price} Wei</p>
      </div>
      {user ? (
          <>
            <button>Try to BET</button>
          </>
        ) : (
          <Link className = "button" to="/login">Login</Link>
        )}
      
    </div>
  );
}

export default CertificateDetail;
