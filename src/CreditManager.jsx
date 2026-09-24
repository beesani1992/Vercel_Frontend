import React, { useState, useEffect } from 'react';

// Package configurations updated to USD ($)
const PACKAGES = [
  { id: '100_credits', credits: 100, label: '100 Credits ⚡', price: 5 },   // $5.00 USD
  { id: '500_credits', credits: 500, label: '500 Credits ⚡', price: 20 },  // $20.00 USD
  { id: '1500_credits', credits: 1500, label: '1500 Credits ⚡', price: 50 } // $50.00 USD
];

export default function CreditManager({ userEmail = 'user@example.com', onCreditsUpdated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({ text: '', type: '' });
  const [isMobile, setIsMobile] = useState(false);

  // Screen size detection for mobile responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to resolve or load Safepay SDK safely
  const getSafepayInstance = () => {
  return new Promise((resolve, reject) => {

    // Check existing globals first
    const getSDK = () =>
      window.Safepay ||
      window.safepay ||
      window.SafepayCheckout;

    const existingSDK = getSDK();

    if (existingSDK) {
      console.log('[Safepay] Existing SDK found:', existingSDK);
      resolve(existingSDK);
      return;
    }

    // Check whether script already exists
    let script = document.querySelector(
      'script[data-safepay-sdk="true"]'
    );

    if (script) {
      console.log('[Safepay] SDK script already exists');

      // It may already have loaded but not exposed the expected global
      const sdkAfterExistingScript = getSDK();

      if (sdkAfterExistingScript) {
        resolve(sdkAfterExistingScript);
        return;
      }

      const timeout = setTimeout(() => {
        reject(
          new Error(
            'Safepay SDK script exists but SDK global was not initialized.'
          )
        );
      }, 10000);

      script.addEventListener('load', () => {
        clearTimeout(timeout);

        const sdk = getSDK();

        if (sdk) {
          console.log('[Safepay] SDK loaded:', sdk);
          resolve(sdk);
        } else {
          reject(
            new Error(
              'Safepay script loaded, but no Safepay SDK global was found.'
            )
          );
        }
      }, { once: true });

      script.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('Safepay SDK failed to load.'));
      }, { once: true });

      return;
    }

    // Create script
    script = document.createElement('script');

    script.src =
      'https://sandbox.api.getsafepay.com/checkout.js';

    script.async = true;

    script.dataset.safepaySdk = 'true';

    script.onload = () => {
      console.log('[Safepay] checkout.js loaded');

      const sdk = getSDK();

      console.log('[Safepay] Available globals:', {
        Safepay: window.Safepay,
        safepay: window.safepay,
        SafepayCheckout: window.SafepayCheckout
      });

      if (sdk) {
        resolve(sdk);
      } else {
        reject(
          new Error(
            'checkout.js loaded, but Safepay SDK global was not found.'
          )
        );
      }
    };

    script.onerror = () => {
      reject(
        new Error(
          'Failed to load Safepay checkout.js. Check browser Network tab, CSP, ad-blocker, or Safepay SDK URL.'
        )
      );
    };

    document.head.appendChild(script);

    // Absolute timeout
    setTimeout(() => {
      reject(
        new Error(
          'Safepay SDK initialization timed out after 10 seconds.'
        )
      );
    }, 10000);
  });
};

      // 2. Call Backend API to create Tracker Token
      console.log('[Safepay] Sending request to backend...');
      const response = await fetch('https://vercel-backend-two-umber.vercel.app/api/payments/createsafepaytracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          amount: selectedPkg.price,
          currency: 'USD',
          packageId: selectedPkg.id,
          email: userEmail
        })
      });

      clearTimeout(timeoutId);

      // Parse response status
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Safepay] Backend responded with error status:', response.status, errorText);
        throw new Error(`Backend Error (${response.status}): ${errorText || 'Failed to communicate with payment server.'}`);
      }

      const data = await response.json();
      console.log('[Safepay] Backend Response:', data);

      if (!data.success || !data.trackerToken) {
        throw new Error(data.message || 'Failed to generate tracker token from Safepay.');
      }
      
      const trackerToken = data.trackerToken;
      const checkout = SafepaySDK.Checkout || SafepaySDK;

      // 2. Launch Safepay Sandbox Checkout SDK Modal
      checkout.open({
        tracker: trackerToken,
        environment: 'sandbox',
        onSuccess: async () => {
          await verifyPaymentWithBackend(trackerToken);
        },
        onDismiss: () => {
          setIsProcessing(false);
          setPaymentStatus({ text: 'Payment cancelled.', type: 'error' });
        }
      });

    } catch (err) {
      setIsProcessing(false);
      setPaymentStatus({ text: err.message, type: 'error' });
    }
  };

  // 3. Confirm Transaction ID with Server & Update Credits in creditManager table by email
  const verifyPaymentWithBackend = async (trackerToken) => {
    setPaymentStatus({ text: 'Verifying transaction with Safepay...', type: 'info' });

    try {
      const response = await fetch('https://vercel-backend-two-umber.vercel.app/api/payments/verify-safepay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackerToken: trackerToken,
          packageId: selectedPkg.id,
          email: userEmail
        })
      });

      const resData = await response.json();

      if (resData.success) {
        setPaymentStatus({
          text: `Payment Successful! Added ${resData.addedCredits || selectedPkg.credits} Credits to your account.`,
          type: 'success'
        });

        // Callback to update local state in header
        if (onCreditsUpdated) {
          onCreditsUpdated(resData.newCreditBalance);
        }

        setTimeout(() => {
          setIsOpen(false);
          setPaymentStatus({ text: '', type: '' });
          setIsProcessing(false);
        }, 2200);
      } else {
        throw new Error(resData.message || 'Transaction verification failed.');
      }
    } catch (err) {
      setIsProcessing(false);
      setPaymentStatus({ text: err.message, type: 'error' });
    }
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        style={triggerBtnStyle}
      >
        + Buy Credits ⚡
      </button>

      {/* SAFEPAY MODAL POPUP */}
      {isOpen && (
        <div style={overlayStyle}>
          <div style={{
            ...modalStyle,
            padding: isMobile ? '16px' : '24px'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#00f3ff', fontSize: isMobile ? '1.2rem' : '1.4rem' }}>
                Buy Credits (Safepay)
              </h2>
              <button onClick={() => setIsOpen(false)} style={closeBtnStyle}>✕</button>
            </div>

            {/* Package Selection */}
            <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '0.95rem' }}>Select a Package</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '20px'
            }}>
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
                    <div style={{ fontSize: isMobile ? '0.95rem' : '1rem', fontWeight: 'bold', color: '#00f3ff' }}>
                      {pkg.label}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>
                      ${pkg.price} USD
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status & Error Message Box */}
            {paymentStatus.text && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                background: paymentStatus.type === 'error' ? 'rgba(255, 50, 50, 0.15)' : 'rgba(0, 243, 255, 0.15)',
                color: paymentStatus.type === 'error' ? '#ff6b6b' : '#00f3ff',
                border: paymentStatus.type === 'error' ? '1px solid #ff3232' : '1px solid #00f3ff'
              }}>
                {paymentStatus.text}
              </div>
            )}

            {/* Checkout Action Button */}
            <button
              onClick={handleSafepayCheckout}
              disabled={isProcessing}
              style={{
                ...checkoutBtnStyle,
                opacity: isProcessing ? 0.6 : 1,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              {isProcessing ? 'Processing Transaction...' : `Pay $${selectedPkg.price} USD via Safepay 💳`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Inline Styles
const triggerBtnStyle = {
  background: 'rgba(0, 243, 255, 0.15)',
  color: '#00f3ff',
  border: '1px solid #00f3ff',
  padding: '6px 14px',
  borderRadius: '20px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.85rem',
  transition: '0.3s'
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  justify: 'center',
  alignItems: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
  padding: '12px'
};

const modalStyle = {
  background: '#16161a',
  border: '1px solid rgba(0, 243, 255, 0.3)',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '480px',
  maxHeight: '90vh',
  overflowY: 'auto',
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

const checkoutBtnStyle = {
  width: '100%',
  padding: '12px',
  background: 'linear-gradient(90deg, #00f3ff, #0088ff)',
  color: '#000',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '0.95rem'
};
