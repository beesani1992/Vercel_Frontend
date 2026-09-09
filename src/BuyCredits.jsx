import React, { useState } from 'react';
import PaymentDetailsModal from './components/PaymentDetailsModal';

export default function BuyCredits({ userId }) {
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const packages = [
    { id: 'starter', credits: 100, price: 5 },
    { id: 'pro', credits: 500, price: 20 },
    { id: 'ultra', credits: 1500, price: 50 },
  ];

  const handleOpenDetails = (pkg) => {
    setSelectedPkg(pkg);
    setIsModalOpen(true);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', color: '#FFF', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#4F46E5', marginBottom: '8px' }}>Buy Credits</h2>
      <p style={{ textAlign: 'center', color: '#9CA3AF', marginBottom: '30px' }}>
        Send manual payment via Payoneer, JazzCash, or EasyPaisa then click <strong>Payment Details</strong> to submit your receipt.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {packages.map((pkg) => (
          <div key={pkg.id} style={styles.card}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>{pkg.credits} Credits</h3>
            <p style={{ fontSize: '2rem', fontWeight: '800', color: '#38BDF8', margin: '0 0 20px 0' }}>${pkg.price} USD</p>
            
            {/* PAYMENT DETAILS BUTTON */}
            <button
              onClick={() => handleOpenDetails(pkg)}
              style={styles.detailsBtn}
            >
              📝 Payment Details
            </button>
          </div>
        ))}
      </div>

      {/* POPUP MODAL FORM */}
      <PaymentDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPackage={selectedPkg}
        userId={userId}
      />
    </div>
  );
}

const styles = {
  card: { background: '#111827', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #1F2937', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
  detailsBtn: { width: '100%', padding: '12px', background: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }
};
