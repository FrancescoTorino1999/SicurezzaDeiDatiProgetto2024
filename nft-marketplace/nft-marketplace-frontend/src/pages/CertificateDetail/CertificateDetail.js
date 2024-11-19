import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./CertificateDetail.css";
import { Link } from 'react-router-dom';


function CertificateDetail({ user, password }) {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [expirationBet, setExpirationBet] = useState(null);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [disableTesta, setDisableTesta] = useState(false);
  const [disableCroce, setDisableCroce] = useState(false);
  

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (certificate) {
        const difference = new Date(certificate.expiringBetDate) - new Date();
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setExpirationBet(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          clearInterval(intervalId);
          setExpirationBet("0d 0h 0m 0s");
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [certificate]);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(`http://localhost:8100/api/certificates/${id}`);
        const data = await response.json();
        setCertificate(data);

        // Disabilita i pulsanti in base a bettertesta e bettercroce
        setDisableTesta(data.bettertesta.trim() !== "");
        setDisableCroce(data.bettercroce.trim() !== "");
      } catch (error) {
        console.error("Errore nel recuperare il certificato:", error);
      }
    };

    fetchCertificate();
  }, [id]);

  const handleCloseChoiceModal = () => {
    setIsChoiceModalOpen(false);
  };

  const handleChoice = async (choice) => {
    if (!certificate) return;
  
    try {
      const response = await fetch(`http://localhost:8100/api/certificates/${certificate._id}/bet`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: user.address, choice, password: password }),
      });
  
      if (!response.ok) throw new Error("Errore durante la scommessa.");
  
      const updatedCertificate = await response.json();
      setCertificate(updatedCertificate);
  
      // Mostra il risultato del vincitore se è stato deciso
      
  
      handleCloseChoiceModal();
    } catch (err) {
      console.error("Errore:", err);
      alert("Errore durante la scommessa.");
    }
  };

  if (!certificate) return <p>Caricamento...</p>;

  return (
    <div className="certificate-detail">
      <Link style={{ marginBottom: "30px" }} className="button" to="/home">Go Back To List</Link>
      <div className='img-container'>
        <img className="immagecert-detail" alt="icon" src={`../images/${certificate.certificateAuthority}.png`} />
      </div>
      <div className='button-container'>
        <a
          href={`../certificates/${certificate.certificateId}.crt`}
          download={`../certificates/${certificate.certificateId}.crt`}
          className="button"
        >
          Download Certificate
        </a>

        <a
          href={`../certificates/${certificate.certificateId}.pub`}
          download={`../certificates/${certificate.certificateId}.pub`}
          className="button"
        >
          Download Public Key
        </a>
      </div>
      <div className='certificate-card'>
        <h2>Certificate Details</h2>
            
        <p><strong>Certificate ID:</strong> {certificate._id}</p>
        <p><strong>CA Issuer:</strong> {certificate.certificateAuthority}</p>
        <p><strong>Status:</strong> {certificate.status}</p>
        <p><strong>Bet Price:</strong> {certificate.price} Wei</p>
        {user ? (
          <>
            <p><strong>Expiration bet in:</strong> {expirationBet}</p>
            {certificate.bettertesta !== user.address && certificate.bettercroce !== user.address && (
              <button style={{ marginTop: "30px" }} onClick={() => setIsChoiceModalOpen(true)}>Try to BET</button>
            )}

          <p>
            <strong>
              {certificate.bettertesta === user.address
                ? "Hai scommesso Testa"
                : certificate.bettercroce === user.address
                ? "Hai scommesso Croce"
                : certificate.bettertesta !== " "
                ? "Un utente ha scommesso Testa"
                : certificate.bettercroce !== " "
                ? "Un utente ha scommesso Croce"
                : "Nessuna scommessa è stata fatta"}
            </strong>
          </p>    
          </>
        ) : (
          <Link style={{ marginTop: "30px" }} className="button" to="/login">Login</Link>
        )}
      </div>

      {isChoiceModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <p>Choose heads or tails:</p>
            {/* Mostra il pulsante "Heads" solo se bettertesta === " " */}
            {certificate.bettertesta === " " && (
              <button onClick={() => handleChoice("Testa")}>
                Heads
              </button>
            )}
            {/* Mostra il pulsante "Tails" solo se bettercroce === " 2" */}
            {certificate.bettercroce === " " && (
              <button onClick={() => handleChoice("Croce")}>
                Tails
              </button>
            )}
            <button onClick={handleCloseChoiceModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateDetail;