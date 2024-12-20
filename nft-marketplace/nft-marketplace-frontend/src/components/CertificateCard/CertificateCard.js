// CertificateCard.js
import React from 'react';
import './CertificateCard.css';
import { Link } from 'react-router-dom';

const CertificateCard = ({ cert }) => {
  return (
    <Link to={`/certificates/${cert._id}`}>
      <div className="certificate-card">
        <img className = "immagecert" alt = "icon" src = {`../images/${cert.certificateAuthority}.png`}/>
        <h3>{cert.certificateCode}</h3>
        <p><strong>ID Certificato:</strong> {cert._id}</p>
        <p><strong>CA Emittente:</strong> {cert.certificateAuthority}</p>
        <p><strong>Status:</strong> {cert.status}</p>
      </div>
    </Link>
  );
};

export default CertificateCard;
