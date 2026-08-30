import React, { useState } from 'react';

export default function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP Verification States
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Submit Login / Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.requiresOtp) {
        setShowOtpScreen(true);
      } else if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        onLoginSuccess();
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        alert('Email verified successfully!');
        onLoginSuccess();
      } else {
        alert(data.message || 'Verification failed');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {!showOtpScreen ? (
          /* LOGIN / REGISTER FORM */
          <form onSubmit={handleSubmit}>
            <h2 style={{ color: '#00f3ff', textAlign: 'center' }}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Processing...' : isRegister ? 'Send OTP' : 'Login'}
            </button>
            <p
              onClick={() => setIsRegister(!isRegister)}
              style={{ color: '#aaa', cursor: 'pointer', textAlign: 'center', marginTop: '15px' }}
            >
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </p>
          </form>
        ) : (
          /* OTP VERIFICATION FORM */
          <form onSubmit={handleVerifyOtp}>
            <h2 style={{ color: '#00f3ff', textAlign: 'center' }}>Enter Verification Code</h2>
            <p style={{ color: '#ccc', textAlign: 'center', fontSize: '0.9rem' }}>
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <input
              type="text"
              maxLength="6"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{ ...inputStyle, textAlign: 'center', letterSpacing: '6px', fontSize: '1.4rem' }}
            />
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button
              type="button"
              onClick={() => setShowOtpScreen(false)}
              style={{ ...btnStyle, background: 'transparent', border: '1px solid #333', marginTop: '10px' }}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Inline Styles
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a0a' };
const cardStyle = { background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid rgba(0,243,255,0.3)', width: '350px' };
const inputStyle = { width: '100%', padding: '12px', margin: '10px 0', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', background: '#00f3ff', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };