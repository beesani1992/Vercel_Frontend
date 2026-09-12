// src/components/AuthenticatedPaymentForm.jsx
import React, { useState, useEffect } from 'react';

export default function PaymentDetailsModal() {
  const [userEmail, setUserEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Read session email saved in localStorage upon login
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.email) setUserEmail(parsed.email);
      } catch (err) {
        console.error('Failed to parse user session:', err);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      alert('User session Expired. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://vercel-backend-two-umber.vercel.app/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          email: userEmail,
          amount,
          transactionId,
          paymentMethod
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setAmount('');
        setTransactionId('');
      } else {
        alert(data.message || 'Payment submission failed.');
      }
    } catch (err) {
      alert(`Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#00f3ff', textAlign: 'center', marginBottom: '8px' }}>Submit Manual Payment</h2>
        <p style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', marginBottom: '20px' }}>
          Logged in as: <strong style={{ color: '#fff' }}>{userEmail || 'Loading session...'}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            step="0.01"
            placeholder="Amount Paid ($)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Transaction ID / Reference ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
            style={inputStyle}
          />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={inputStyle}
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="easypaisa">EasyPaisa</option>
            <option value="crypto">Binance</option>
          </select>

          <button type="submit" disabled={loading || !userEmail} style={btnStyle}>
            {loading ? 'Submitting...' : 'Confirm Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', background: '#0a0a0a' };
const cardStyle = { background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid rgba(0,243,255,0.3)', width: '360px' };
const inputStyle = { width: '100%', padding: '12px', margin: '8px 0', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', background: '#00f3ff', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px' };
