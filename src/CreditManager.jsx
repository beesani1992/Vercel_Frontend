import React, { useState } from 'react';

export default function CreditManager() {
  const [isOpen, setIsOpen] = useState(false);

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

            {/* Credit Packages */}
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>1. Select a Package</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div style={packageCardStyle}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00f3ff' }}>100 Credits ⚡</div>
                <div style={{ fontSize: '1rem', color: '#aaa', marginTop: '4px' }}>$5.00</div>
              </div>
              <div style={packageCardStyle}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00f3ff' }}>250 Credits ⚡</div>
                <div style={{ fontSize: '1rem', color: '#aaa', marginTop: '4px' }}>$10.00</div>
              </div>
            </div>

            {/* Account Details */}
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>2. Transfer Payment</h4>
            <div style={accountDetailsStyle}>
              <p style={{ margin: '5px 0' }}><strong>Bank / Method:</strong> JazzCash / EasyPaisa </p>
              <p style={{ margin: '5px 0' }}><strong>Account Title:</strong> Bhasham Kumar </p>
              <p style={{ margin: '5px 0' }}><strong>Account Number:</strong> 03152829660</p>
            </div>

            {/* Instructions */}
            <div style={{ fontSize: '0.85rem', color: '#888', background: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222' }}>
              ℹ️ <strong>Instructions:</strong> After sending payment, send a screenshot of your transaction along with your account email to support/WhatsApp. Credits will be added manually within a few minutes.
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setIsOpen(false)} style={doneBtnStyle}>Done</button>
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
  background: '#0d0d11',
  border: '1px solid #222',
  borderRadius: '8px',
  padding: '12px',
  textAlign: 'center'
};

const accountDetailsStyle = {
  background: '#0d0d11',
  border: '1px solid rgba(0, 243, 255, 0.2)',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '0.9rem',
  marginBottom: '15px'
};

const doneBtnStyle = {
  background: '#00f3ff',
  color: '#000',
  border: 'none',
  padding: '8px 20px',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
};