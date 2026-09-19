import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Package configurations with numerical amounts for Safepay processing
const PACKAGES = [
  { id: '100_credits', credits: 100, label: '100 Credits ⚡', price: 1500, priceDisplay: 'PKR 1,500' },
  { id: '500_credits', credits: 500, label: '500 Credits ⚡', price: 6000, priceDisplay: 'PKR 6,000' },
  { id: '1500_credits', credits: 1500, label: '1500 Credits ⚡', price: 15000, priceDisplay: 'PKR 15,000' }
];

export default function CreditManager({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[0]);
  const [loading, setLoading] = useState(false);

  // Dynamically load Safepay Checkout JS SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3-us-west-2.amazonaws.com/safepayassets/safepay-checkout.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle Automated Safepay Payment
  const handleSafepayPayment = async () => {
    setLoading(true);
    try {
      // 1. Call Express/FastAPI backend to generate Safepay Tracker Token
      const response = await axios.post('/api/payments/create-checkout', {
        amount: selectedPkg.price,
        currency: 'PKR',
        creditAmount: selectedPkg.credits,
        packageId: selectedPkg.id,
        userId: userId
      });

      const { token } = response.data;

      // 2. Open Safepay Hosted Modal
      if (window.safepay) {
        window.safepay.Checkout.open({
          env: process.env.REACT_APP_SAFEPAY_ENV || 'sandbox', // 'sandbox' or 'production'
          tracker: token,
          utility: 'checkout',
          onCompleted: (data) => {
            alert('Payment completed successfully! Your credits will reflect shortly.');
            setIsOpen(false);
          },
          onCancelled: () => {
            setLoading(false);
          }
        });
      } else {
        alert('Safepay SDK failed to load. Please check your network connection.');
      }
    } catch (err) {
      console.error('Safepay checkout error:', err);
      alert('Failed to initialize payment session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button in Nav */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: 'rgba(0, 243, 255, 0.15)',
          color: '#00f3ff',
          border: '1px solid #00f3ff',
          padding: '6px 14px',
          borderRadius: '20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: '0.3s'
        }}
      >
        + Buy Credits ⚡
      </button>

      {/* POPUP MODAL */}
      {isOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#00f3ff', fontSize: '1.4rem' }}>Buy Credits</h2>
              <button onClick={() => setIsOpen(false)} style={closeBtnStyle}>✕</button>
            </div>

            {/* Step 1: Package Selection */}
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>1. Select a Package</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {PACKAGES.map((pkg) => {
                const isSelected = selectedPkg.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg)}
                    style={{
                      ...packageCardStyle,
                      border: isSelected ? '1px solid #00f3ff' : '1px solid #222',
                      background: isSelected ? 'rgba(0, 243, 255, 0.1)' : '#0d0d11',
                      boxShadow: isSelected ? '0 0 10px rgba(0, 243, 255, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#00f3ff' }}>{pkg.label}</div>
                    <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>{pkg.priceDisplay}</div>
                  </div>
                );
              })}
            </div>

            {/* Step 2: Payment Provider Card */}
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>2. Payment Gateway</h4>
            <div style={providerCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Safepay Checkout</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#aaa', fontSize: '0.8rem' }}>
                    Pay via EasyPaisa, JazzCash, Visa, or Mastercard
                  </p>
                </div>
                <span style={badgeStyle}>Instant Auto-Credit</span>
              </div>
            </div>

            {/* Info Note */}
            <div style={infoBoxStyle}>
              🔒 <strong>Automated Verification:</strong> Upon successful checkout, your account credits will update automatically via Webhook.
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setIsOpen(false)} style={cancelBtnStyle}>
                Cancel
              </button>
              <button 
                onClick={handleSafepayPayment} 
                disabled={loading}
                style={{
                  ...payBtnStyle,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Initializing...' : `Pay ${selectedPkg.priceDisplay} with Safepay`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Inline Styles
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

const modalStyle = {
  background: '#16161a',
  border: '1px solid rgba(0, 243, 255, 0.3)',
  borderRadius: '12px',
  padding: '24px',
  width: '90%',
  maxWidth: '480px',
  boxShadow: '0 0 20px rgba(0, 243, 255, 0.2)',
  color: '#fff'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#aaa',
  fontSize: '1.2rem',
  cursor: 'pointer'
};

const packageCardStyle = {
  borderRadius: '8px',
  padding: '12px 8px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out'
};

const providerCardStyle = {
  background: '#0d0d11',
  border: '1px solid rgba(0, 243, 255, 0.25)',
  borderRadius: '8px',
  padding: '14px',
  marginBottom: '15px'
};

const badgeStyle = {
  background: 'rgba(0, 243, 255, 0.15)',
  color: '#00f3ff',
  fontSize: '0.75rem',
  padding: '4px 8px',
  borderRadius: '4px',
  border: '1px solid rgba(0, 243, 255, 0.3)'
};

const infoBoxStyle = {
  fontSize: '0.82rem',
  color: '#888',
  background: '#111',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #222',
  lineHeight: '1.4'
};

const cancelBtnStyle = {
  background: 'transparent',
  color: '#aaa',
  border: '1px solid #333',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer'
};

const payBtnStyle = {
  background: '#00f3ff',
  color: '#000',
  border: 'none',
  padding: '8px 18px',
  borderRadius: '6px',
  fontWeight: 'bold'
};
