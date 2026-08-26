import React, { useState } from 'react';
import './AuthPage.css'; // <-- Import the CSS file

export default function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    
    const res = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      onLoginSuccess(data.user);
    } else {
      alert(data.message || 'Success');
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="neon-form" onSubmit={handleSubmit}>
        <h2 className="neon-title">{isRegister ? 'Register' : 'Login'}</h2>
        
        {isRegister && (
          <input 
            className="neon-input"
            placeholder="Username" 
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
          />
        )}
        
        <input 
          className="neon-input"
          placeholder="Email" 
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
        />
        
        <input 
          className="neon-input"
          type="password" 
          placeholder="Password" 
          onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
        />
        
        <button className="neon-button" type="submit">
          {isRegister ? 'Sign Up' : 'Sign In'}
        </button>
        
        <p className="neon-toggle" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
        </p>
      </form>
    </div>
  );
}