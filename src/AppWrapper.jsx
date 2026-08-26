import React, { useState, useEffect } from 'react';
import App from './App';
import AuthPage from './AuthPage';
import Profile from './Profile';
import CreditManager from './CreditManager';

export default function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState('app');
  const [credits, setCredits] = useState(0);

  const fetchCredits = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/auth/credits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      }
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchCredits();
    }
  }, []);

  const handleUseCredit = async (amount = 1) => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/auth/use-credit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });

    const data = await res.json();
    if (res.ok) {
      setCredits(data.remainingCredits);
      return true;
    } else {
      alert(data.message || 'Error using credit');
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => { setIsAuthenticated(true); fetchCredits(); }} />;
  }

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px 30px',
        background: '#111',
        borderBottom: '1px solid rgba(0, 243, 255, 0.2)'
      }}>
        <button onClick={() => setView('app')} style={navBtnStyle}>Main App</button>
        <button onClick={() => setView('profile')} style={navBtnStyle}>Profile</button>

        {/* --- CREDIT MANAGER & DISPLAY INTEGRATION --- */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid #00f3ff',
            boxShadow: '0 0 10px rgba(0, 243, 255, 0.3)',
            color: '#00f3ff',
            fontWeight: 'bold'
          }}>
            ⚡ Credits: {credits}
          </div>

          {/* Standalone Add Credit Trigger */}
          <CreditManager onCreditsUpdated={(newBalance) => setCredits(newBalance)} />
        </div>

        <button onClick={handleLogout} style={{ ...navBtnStyle, borderColor: '#ff0055', color: '#ff0055' }}>
          Logout
        </button>
      </nav>

      <main style={{ padding: '20px' }}>
        {view === 'app' ? (
          <App credits={credits} useCredit={handleUseCredit} />
        ) : (
          <Profile credits={credits} />
        )}
      </main>
    </div>
  );
}

const navBtnStyle = {
  background: 'transparent',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.2)',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: '0.3s'
};