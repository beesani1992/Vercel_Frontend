import React, { useState, useEffect } from 'react';

// Helper function to decode JWT payload without external packages
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to decode JWT token:', err);
    return null;
  }
};


export default function PaymentDetailsModal({ isOpen, onClose, selectedPackage, userId }) {
  const [userEmail, setUserEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [creditsRequested, setCreditsRequested] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 1. Pre-fill package details
      if (selectedPackage) {
        setAmount(selectedPackage.price || '');
        setCreditsRequested(selectedPackage.credits || '');
      }

      let detectedEmail = '';
      let detectedId = userId || '';

      // 2. Check localStorage 'user' object
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          detectedEmail = parsed.email || parsed.user_email || '';
          if (!detectedId) detectedId = parsed.id || parsed.userId || '';
        } catch (err) {
          console.error('Error parsing stored user:', err);
        }
      }

      // 3. Fallback: Parse stored JWT token if email is still missing
      if (!detectedEmail) {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = parseJwt(token);
          if (decoded) {
            detectedEmail = decoded.email || decoded.user_email || decoded.sub || '';
            if (!detectedId) detectedId = decoded.id || decoded.userId || decoded.sub || '';
          }
        }
      }

      setUserEmail(detectedEmail);
      setActiveUserId(detectedId);
    }
  }, [isOpen, selectedPackage, userId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    // Allow submit if email/id exists OR if a valid token is present
    if (!userEmail && !activeUserId && !token) {
      alert('Active user session not found. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://vercel-backend-two-umber.vercel.app/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          userId: activeUserId || null,
          email: userEmail || null,
          packageId: selectedPackage?.id || 'custom',
          amount: parseFloat(amount),
          creditsRequested: parseInt(creditsRequested, 10),
          transactionId: transactionId.trim(),
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || 'Payment submitted successfully!');
        setTransactionId('');
        onClose();
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
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        <div style={styles.header}>
          <h2 style={styles.modalTitle}>📝 Submit Payment Details</h2>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>

        {selectedPackage && (
          <div style={styles.packageBanner}>
            <span style={{ fontWeight: '600', color: '#4F46E5' }}>
              Selected Package: {selectedPackage.credits} Credits (${selectedPackage.price})
            </span>
          </div>
        )}

        <p style={styles.userInfoText}>
          Account: <strong style={{ color: '#1F2937' }}>{userEmail || activeUserId || 'Authenticated Session'}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={styles.input}
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="easypaisa">EasyPaisa / JazzCash</option>
            <option value="crypto">Crypto / USDT</option>
          </select>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Amount Paid ($)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Credits Requested</label>
              <input
                type="number"
                value={creditsRequested}
                onChange={(e) => setCreditsRequested(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <label style={styles.label}>Transaction / Reference ID</label>
          <input
            type="text"
            placeholder="e.g. TRX-987654321"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
            style={styles.input}
          />

          <div style={styles.buttonGroup}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { background: '#FFFFFF', width: '90%', maxWidth: '440px', padding: '28px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #E2E8F0' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  modalTitle: { color: '#1F2937', margin: 0, fontSize: '1.25rem', fontWeight: '700' },
  closeBtn: { background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.5rem', cursor: 'pointer', lineHeight: '1' },
  packageBanner: { background: '#EEF2FF', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.875rem' },
  userInfoText: { color: '#6B7280', fontSize: '0.85rem', marginBottom: '16px' },
  label: { display: 'block', color: '#374151', fontSize: '0.8rem', fontWeight: '600', marginTop: '12px', marginBottom: '4px' },
  input: { width: '100%', padding: '10px 12px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#1F2937', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' },
  buttonGroup: { display: 'flex', gap: '10px', marginTop: '24px' },
  cancelBtn: { flex: 1, padding: '12px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  submitBtn: { flex: 1, padding: '12px', background: '#4F46E5', border: 'none', color: '#FFF', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
};
