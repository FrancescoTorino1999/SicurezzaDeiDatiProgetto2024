import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function CertificateDetail() {
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

  if (!certificate) return <p>Caricamento...</p>;

  return (
    <div className="certificate-detail">
      <h2>Dettaglio Certificato</h2>
      <p><strong>ID Certificato:</strong> {certificate._id}</p>
      <p><strong>Codice Certificato:</strong> {certificate.certificateCode}</p>
      <p><strong>CA Emittente:</strong> {certificate.certificateAuthority}</p>
      <p><strong>Status:</strong> {certificate.status}</p>
      <p><strong>Data Inizio:</strong> {certificate.startDate}</p>
      <p><strong>Data Fine:</strong> {certificate.endDate}</p>
      {/* Aggiungi altre informazioni necessarie */}
    </div>
  );
}

export default CertificateDetail;
