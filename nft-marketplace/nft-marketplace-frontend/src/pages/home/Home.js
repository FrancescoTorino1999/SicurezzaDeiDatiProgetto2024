// src/pages/home/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CertificateCard from '../../components/CertificateCard/CertificateCard';

function Home() {
  // Stato per memorizzare i certificati
  const [certificates, setCertificates] = useState([]);

  // Effettua la chiamata API quando il componente viene montato
  useEffect(() => {
    // Funzione asincrona per ottenere i dati
    const fetchCertificates = async () => {
      try {
        const response = await axios.get('http://localhost:8100/api/certificates');
        setCertificates(response.data); // Salva i dati nello stato
        console.log('Certificati ricevuti:', response.data); // Stampa i dati
      } catch (error) {
        console.error('Errore durante il recupero dei certificati:', error);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <div>
      <div className="certificate-list">
        <h1>Certificati</h1>
        <div className="certificate-grid">
          {certificates.map((cert, index) => (
            <CertificateCard key={index} cert={cert} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
