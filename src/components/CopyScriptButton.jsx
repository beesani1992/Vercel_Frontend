import React, { useState } from 'react';

export default function CopyScriptButton({ textToCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      // Reset button text after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy script to clipboard.');
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={!textToCopy}
      style={{
        padding: '8px 16px',
        background: copied ? '#00ff88' : '#00f3ff',
        color: '#000',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: textToCopy ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease-in-out',
        fontSize: '0.85rem'
      }}
    >
      {copied ? '✓ Copied!' : '📋 Copy Script'}
    </button>
  );
}
