// CertificateCard.js
import React from 'react';
import './CertificateCard.css';

const CertificateCard = ({ cert }) => {
  return (
    <div className="certificate-card">
      <h3>{cert.serverName}</h3>
      <p><strong>ID Certificato:</strong> {cert.certificateId}</p>
      <p><strong>CA Emittente:</strong> {cert.issuingCA}</p>
      <p><strong>Status:</strong> {cert.status}</p>
    </div>
  );
};

export default CertificateCard;
