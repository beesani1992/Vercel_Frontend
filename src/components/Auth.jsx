import React, { useState } from 'react';

const API_URL = 'http://localhost:5000';

function Auth({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        throw new Error(`Server returned non-JSON response (Status ${res.status}).`);
      }

      if (!res.ok) {
        alert(data.error || 'Authentication failed');
      } else {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.token, { email: data.email, credits: data.credits });
      }
    } catch (err) {
      alert(`Auth Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        {/* EDITABLE TEXT: Auth Header */}
        <h2 style={styles.authTitle}>
          {isRegistering ? 'Create Studio Account' : 'Welcome Back'}
        </h2>
        <p style={styles.subtitle}>Sign in to access Video-to-Cartoon Studio</p>

        <form onSubmit={handleSubmit} style={styles.authForm}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.inputField}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.inputField}
            required
          />

          {/* EDITABLE TEXT: Button Labels */}
          <button type="submit" style={styles.actionBtn} disabled={loading}>
            {loading
              ? 'Please wait...'
              : isRegistering
              ? 'Sign Up (Claim 100 Free Credits)'
              : 'Log In to Studio'}
          </button>
        </form>

        {/* EDITABLE TEXT: Screen Toggle Link */}
        <p style={styles.authToggle} onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering
            ? 'Already have an account? Log in'
            : "Don't have an account? Register here"}
        </p>
      </div>
    </div>
  );
}

const styles = {
  authContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: '"Inter", sans-serif' },
  authCard: { background: '#FFFFFF', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  authTitle: { fontSize: '1.8rem', fontWeight: '800', color: '#1F2937', margin: '0 0 6px 0' },
  subtitle: { fontSize: '0.95rem', color: '#6B7280', margin: 0 },
  authForm: { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '24px' },
  inputField: { padding: '12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' },
  actionBtn: { padding: '14px', background: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  authToggle: { color: '#4F46E5', fontSize: '0.9rem', marginTop: '16px', cursor: 'pointer', fontWeight: '500' },
};

export default Auth;