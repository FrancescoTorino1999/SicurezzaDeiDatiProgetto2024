import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/home/Home';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login/Login';
import CertificateDetail from './pages/CertificateDetail/CertificateDetail';
import Footer from './components/Footer/Footer';
import UserBets from './pages/UserBets/UserBets';
import { useState } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState(null);
  return (
    <div className='body-site'>
      <Router>
        <Navbar user={user} setUser={setUser}  />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} setPassword={setPassword} />} />
          <Route path="/certificates/:id" element={<CertificateDetail user={user} password={password}/>} /> 
          <Route path="/user-certificates" element={<UserBets user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
          
        </Routes>
        <Footer></Footer>
      </Router>
    </div>
  );
}



export default App;

