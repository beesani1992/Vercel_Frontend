import React, { useState } from 'react';

// Package configurations
const PACKAGES = [
  { id: '100_credits', credits: '100 Credits ⚡', price: '$5.00' },
  { id: '500_credits', credits: '500 Credits ⚡', price: '$20.00' },
  { id: '1500_credits', credits: '1500 Credits ⚡', price: '$50.00' }
];

// Account configurations according to payment type
const ACCOUNTS = {
  easypaisa: {
    method: 'EasyPaisa',
    title: 'Bheesham Kumar',
    number: '03152829660'
  },
  bank: {
    method: 'Bank Transfer (Nayapay)',
    title: 'Bheesham Kumar',
    number: 'PK00XXXX0000000000000000'
  },
  binance: {
    method: 'Binance',
    title: 'Bheesham Kumar',
    number: 'PK00XXXX0000000000000000'
  }
};

export default function CreditManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[0]);
  const [accountType, setAccountType] = useState('easypaisa');
  const [copied, setCopied] = useState(false);

  const activeAccount = ACCOUNTS[accountType];

  // Copy Account Number to Clipboard
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(activeAccount.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

            {/* Credit Packages */}
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
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#00f3ff' }}>{pkg.credits}</div>
                    <div style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '4px' }}>{pkg.price}</div>
                  </div>
                );
              })}
            </div>

            {/* Account Details & Dropdown */}
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>2. Transfer Payment</h4>
            
            {/* Payment Method Selector */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', color: '#aaa', fontSize: '0.85rem', marginBottom: '5px' }}>
                Select Payment Method:
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                style={selectStyle}
              >
                <option value="easypaisa">EasyPaisa</option>
                <option value="bank">Bank Transfer (Nayapay)</option>
                <option value="binance">Binance</option>
              </select>
            </div>

            {/* Dynamic Account Details Card */}
            <div style={accountDetailsStyle}>
              <p style={{ margin: '5px 0' }}>
                <strong>Bank / Method:</strong> {activeAccount.method}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Account Title:</strong> {activeAccount.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '5px 0' }}>
                <p style={{ margin: 0 }}>
                  <strong>Account Number / ID:</strong>{' '}
                  <span style={{ color: '#00f3ff', fontFamily: 'monospace' }}>{activeAccount.number}</span>
                </p>
                <button onClick={handleCopyAccount} style={copyBtnStyle}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div style={{ fontSize: '0.85rem', color: '#888', background: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222', lineHeight: '1.4' }}>
              ℹ️ <strong>Instructions:</strong> After sending payment, submit your payment details according to your package. After verification, credits will be added to your profile within a few minutes.
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
  borderRadius: '8px',
  padding: '12px 8px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out'
};

const selectStyle = {
  width: '100%',
  padding: '8px 12px',
  background: '#0d0d11',
  border: '1px solid rgba(0, 243, 255, 0.3)',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  cursor: 'pointer'
};

const accountDetailsStyle = {
  background: '#0d0d11',
  border: '1px solid rgba(0, 243, 255, 0.2)',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '0.9rem',
  marginBottom: '15px'
};

const copyBtnStyle = {
  background: 'rgba(0, 243, 255, 0.1)',
  color: '#00f3ff',
  border: '1px solid #00f3ff',
  borderRadius: '4px',
  padding: '2px 8px',
  fontSize: '0.75rem',
  cursor: 'pointer'
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
