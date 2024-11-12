import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/home/Home';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login/Login';
import CertificateDetail from './pages/CertificateDetail/CertificateDetail';

function App() {
  return (
    <div className='body-site'>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/certificates/:id" element={<CertificateDetail />} />
          <Route path="*" element={<Navigate to="/" />} />
          
        </Routes>
      </Router>
    </div>
  );
}



export default App;

