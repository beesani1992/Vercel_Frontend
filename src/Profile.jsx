import React, { useEffect, useState } from 'react';
import './AuthPage.css';

export default function Profile({ credits }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  if (!user) return <p style={{ color: '#00f3ff', textAlign: 'center', marginTop: '50px' }}>Loading profile...</p>;

  return (
    <div className="auth-wrapper">
      <div className="neon-form" style={{ maxWidth: '450px' }}>
        <h2 className="neon-title">User Profile</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: '#fff' }}>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Available Credits:</strong> <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>⚡ {credits ?? user.credits}</span></p>
          <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}