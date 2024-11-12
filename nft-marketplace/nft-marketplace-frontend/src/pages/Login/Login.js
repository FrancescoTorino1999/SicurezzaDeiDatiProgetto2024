import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./Login.css";

function Login() {
  useEffect(() => {
    
  }, []);

  return (
    <div className='box-login-container'>
        <div className="login-box">
        <h2>Login</h2>
        <form>
            <div className="user-box">
            <input type="text" name="" required=""/>
            <label>Username</label>
            </div>
            <div className="user-box">
            <input type="password" name="" required=""/>
            <label>Password</label>
            </div>
            <button style = {{width: "100%"}} type="button">Login</button>
        </form>
        </div>
    </div>
  );
}

export default Login;
