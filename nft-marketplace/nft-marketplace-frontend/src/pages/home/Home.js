// src/pages/home/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CertificateCard from '../../components/CertificateCard/CertificateCard';

function Home() {
  const [certificates, setCertificates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const certificatesPerPage = 10; // Numero di certificati per pagina

  // Effettua la chiamata API quando il componente viene montato
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get('http://localhost:8100/api/certificates');
        setCertificates(response.data);
        console.log('Certificati ricevuti:', response.data);
      } catch (error) {
        console.error('Errore durante il recupero dei certificati:', error);
      }
    };

    fetchCertificates();
  }, []);

  // Calcolo degli indici per la paginazione
  const indexOfLastCertificate = currentPage * certificatesPerPage;
  const indexOfFirstCertificate = indexOfLastCertificate - certificatesPerPage;
  const currentCertificates = certificates.slice(indexOfFirstCertificate, indexOfLastCertificate);

  // Funzioni di gestione della paginazione
  const totalPages = Math.ceil(certificates.length / certificatesPerPage);

  const goToNextPage = () => {
    setCurrentPage((prevPage) => (prevPage < totalPages ? prevPage + 1 : prevPage));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
  };

  return (
    <div>
      <div className="certificate-list">
        <h1>Certificati</h1>
        <div className="certificate-grid">
          {currentCertificates.map((cert, index) => (
            <CertificateCard key={index} cert={cert} />
          ))}
        </div>
        {/* Controlli di paginazione */}
        <div className="pagination">
          <button onClick={goToPreviousPage} disabled={currentPage === 1}>
            &lt;
          </button>
          <span className='colored-span'>
            Pagina {currentPage} di {totalPages}
          </span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages}>
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
