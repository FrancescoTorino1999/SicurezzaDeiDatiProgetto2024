import React, { useEffect, useState } from 'react';
import CertificateCard from '../../components/CertificateCard/CertificateCard';

function UserBets({ user }) {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(`http://localhost:8100/api/certificates`);
        const data = await response.json();
        
        // Filtra i certificati con bettertesta o bettercroce uguale a user.address
        const userCertificates = data.filter(cert =>
          cert.bettertesta === user.address || cert.bettercroce === user.address
        );

        setCertificates(userCertificates);
      } catch (error) {
        console.error("Errore nel recupero dei certificati:", error);
      }
    };

    fetchCertificates();
  }, [user.address]);

  const [currentPage, setCurrentPage] = useState(1);
  const certificatesPerPage = 10; // Numero di certificati per pagina

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
        <h1>Your Bets</h1>
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

export default UserBets;