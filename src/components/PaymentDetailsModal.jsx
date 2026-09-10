import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function PaymentDetailsModal({ isOpen, onClose, selectedPackage, userId }) {
  const [paymentMethod, setPaymentMethod] = useState('Payoneer');
  const [senderAccount, setSenderAccount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Verify userId exists before sending query
  if (!userId) {
    return setErrorMsg('User session expired. Please log in again.');
  }

    if (!senderAccount || !transactionId) {
      return setErrorMsg('Please complete all fields.');
    }

    setLoading(true);

    try {
      // Direct Insert into Supabase manual_payments table
      const { error } = await supabase
        .from('manual_payments')
        .insert([
          {
            user_id: userId,
            package_id: selectedPackage?.id,
            amount_usd: selectedPackage?.price,
            credits: selectedPackage?.credits,
            payment_method: paymentMethod,
            sender_account: senderAccount.trim(),
            transaction_id: transactionId.trim(),
            status: 'pending' // Explicit status assignment
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('This Transaction ID has already been submitted.');
        }
        throw new Error(error.message);
      }

      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setSenderAccount('');
    setTransactionId('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Payment Details Form</h3>
          <button onClick={handleClose} style={styles.closeBtn}>✕</button>
        </div>

        {success ? (
          <div style={styles.successContainer}>
            <p style={{ fontSize: '2rem', margin: '0 0 10px 0' }}>⏳</p>
            <h4 style={{ color: '#10B981', margin: '0 0 10px 0' }}>Submitted for Verification!</h4>
            <p style={{ color: '#D1D5DB', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Your payment of <strong>${selectedPackage?.price} USD</strong> ({selectedPackage?.credits} Credits) has been saved with status <span style={styles.pendingBadge}>PENDING</span>.
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
              Credits will be added automatically once approved by the admin.
            </p>
            <button onClick={handleClose} style={styles.submitBtn}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={styles.pkgSummary}>
              <span>Package: <strong>{selectedPackage?.credits} Credits</strong></span>
              <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>${selectedPackage?.price} USD</span>
            </div>

            {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

            <div style={styles.field}>
              <label style={styles.label}>Payment Method Used:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={styles.input}
              >
                <option value="Payoneer">Payoneer Receiving Account</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="BankTransfer">Direct Bank Transfer</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Sender Account / Email / Mobile No:</label>
              <input
                type="text"
                placeholder="e.g. sender@email.com or 03001234567"
                value={senderAccount}
                onChange={(e) => setSenderAccount(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Transaction ID / Ref Number (TID):</label>
              <input
                type="text"
                placeholder="e.g. 1029384756"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Saving to Database...' : 'Submit Payment Details'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#111827', color: '#FFF', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { margin: 0, fontSize: '1.25rem', color: '#FFF' },
  closeBtn: { background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.2rem', cursor: 'pointer' },
  pkgSummary: { background: '#1F2937', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.95rem' },
  field: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '6px' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#1F2937', color: '#FFF', fontSize: '0.95rem', boxSizing: 'border-box' },
  submitBtn: { width: '100%', padding: '12px', background: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  errorBox: { background: '#7F1D1D', color: '#FCA5A5', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' },
  successContainer: { textAlign: 'center', padding: '10px 0' },
  pendingBadge: { background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }
};
