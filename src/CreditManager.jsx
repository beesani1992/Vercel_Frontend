import React, { useEffect, useState } from 'react';

// ============================================================
// PACKAGE CONFIGURATION
// ============================================================
// IMPORTANT:
// The backend is the final authority for price and credits.
// These values are only used for displaying the packages in UI.

const PACKAGES = [
  {
    id: '100_credits',
    credits: 100,
    label: '100 Credits ⚡',
    price: 5,
  },
  {
    id: '500_credits',
    credits: 500,
    label: '500 Credits ⚡',
    price: 20,
  },
  {
    id: '1500_credits',
    credits: 1500,
    label: '1500 Credits ⚡',
    price: 50,
  },
];

// ============================================================
// BACKEND
// ============================================================

const BACKEND_URL =
  'https://vercel-backend-two-umber.vercel.app';

// ============================================================
// COMPONENT
// ============================================================

export default function CreditManager({
  userEmail,
  onCreditsUpdated,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedPkg, setSelectedPkg] = useState(
    PACKAGES[0]
  );

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [paymentStatus, setPaymentStatus] = useState({
    text: '',
    type: '',
  });

  const [isMobile, setIsMobile] = useState(false);

  // ==========================================================
  // MOBILE RESPONSIVENESS
  // ==========================================================

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480);
    };

    handleResize();

    window.addEventListener(
      'resize',
      handleResize
    );

    return () => {
      window.removeEventListener(
        'resize',
        handleResize
      );
    };
  }, []);

  // ==========================================================
  // VALIDATE EMAIL
  // ==========================================================

  const isValidEmail = (email) => {
    if (!email) {
      return false;
    }

    const normalizedEmail =
      String(email).trim();

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalizedEmail
    );
  };

  // ==========================================================
  // SAFEPAY CHECKOUT
  // ==========================================================

  const handleSafepayCheckout = async () => {
    if (isProcessing) {
      return;
    }

    // --------------------------------------------------------
    // Validate user email
    // --------------------------------------------------------

    const normalizedEmail =
      String(userEmail || '').trim();

    if (!isValidEmail(normalizedEmail)) {
      setPaymentStatus({
        text:
          'A valid user email is required before starting payment.',
        type: 'error',
      });

      return;
    }

    // --------------------------------------------------------
    // Validate selected package
    // --------------------------------------------------------

    const validPackage = PACKAGES.find(
      (pkg) => pkg.id === selectedPkg?.id
    );

    if (!validPackage) {
      setPaymentStatus({
        text:
          'Invalid credit package selected.',
        type: 'error',
      });

      return;
    }

    // --------------------------------------------------------
    // Start processing
    // --------------------------------------------------------

    setIsProcessing(true);

    setPaymentStatus({
      text:
        'Creating Safepay sandbox payment...',
      type: 'info',
    });

    try {
      console.log(
        '[Safepay] Creating payment...'
      );

      console.log(
        '[Safepay] Package:',
        validPackage
      );

      console.log(
        '[Safepay] User email:',
        normalizedEmail
      );

      // ------------------------------------------------------
      // CREATE PAYMENT SESSION ON BACKEND
      // ------------------------------------------------------
      //
      // IMPORTANT:
      // Do NOT send amount or currency.
      //
      // The backend determines:
      //
      // 100_credits  -> $5
      // 500_credits  -> $20
      // 1500_credits -> $50
      //
      // The backend is therefore the source of truth.
      // ------------------------------------------------------

      const response = await fetch(
        `${BACKEND_URL}/api/payments/create-safepay-tracker`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },

          body: JSON.stringify({
            packageId: validPackage.id,
            userEmail: normalizedEmail,
          }),
        }
      );

      console.log(
        '[Safepay] Backend status:',
        response.status
      );

      // ------------------------------------------------------
      // READ RESPONSE
      // ------------------------------------------------------

      const responseText =
        await response.text();

      console.log(
        '[Safepay] Backend response:',
        responseText
      );

      let data = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            '[Safepay] JSON parse error:',
            parseError
          );

          throw new Error(
            `Backend returned invalid JSON (${response.status}).`
          );
        }
      }

      if (!data) {
        throw new Error(
          `Backend returned an empty response (${response.status}).`
        );
      }

      // ------------------------------------------------------
      // HTTP ERROR
      // ------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Backend error (${response.status}).`
        );
      }

      // ------------------------------------------------------
      // APPLICATION ERROR
      // ------------------------------------------------------

      if (data.success !== true) {
        throw new Error(
          data.message ||
            'Safepay payment initialization failed.'
        );
      }

      // ------------------------------------------------------
      // TRACKER TOKEN
      // ------------------------------------------------------

      const trackerToken =
        data.trackerToken;

      if (
        !trackerToken ||
        typeof trackerToken !== 'string'
      ) {
        console.error(
          '[Safepay] Missing tracker token:',
          data
        );

        throw new Error(
          'Backend did not return a valid Safepay tracker token.'
        );
      }

      console.log(
        '[Safepay] Tracker:',
        trackerToken
      );

      // ------------------------------------------------------
      // CHECKOUT URL
      // ------------------------------------------------------

      const checkoutUrl =
        data.checkoutUrl ||
        data.url ||
        data.redirect;

      if (
        !checkoutUrl ||
        typeof checkoutUrl !== 'string'
      ) {
        console.error(
          '[Safepay] Missing checkout URL:',
          data
        );

        throw new Error(
          'Backend created the payment but did not return a Safepay checkout URL.'
        );
      }

      // ------------------------------------------------------
      // BASIC CHECKOUT URL VALIDATION
      // ------------------------------------------------------

      let parsedCheckoutUrl;

      try {
        parsedCheckoutUrl =
          new URL(checkoutUrl);
      } catch (urlError) {
        console.error(
          '[Safepay] Invalid checkout URL:',
          checkoutUrl
        );

        throw new Error(
          'Safepay returned an invalid checkout URL.'
        );
      }

      if (
        parsedCheckoutUrl.protocol !==
          'https:' &&
        parsedCheckoutUrl.protocol !==
          'http:'
      ) {
        throw new Error(
          'Safepay returned an unsupported checkout URL.'
        );
      }

      console.log(
        '[Safepay] Checkout URL received.'
      );

      // ------------------------------------------------------
      // SAVE PAYMENT INFORMATION
      // ------------------------------------------------------
      //
      // This information is only used by the frontend
      // success/cancel flow.
      //
      // Payment verification MUST still happen on
      // the backend.
      // ------------------------------------------------------

      try {
        sessionStorage.setItem(
          'safepay_tracker',
          trackerToken
        );

        sessionStorage.setItem(
          'safepay_package',
          validPackage.id
        );

        sessionStorage.setItem(
          'safepay_user',
          normalizedEmail
        );

        if (data.orderId) {
          sessionStorage.setItem(
            'safepay_order_id',
            String(data.orderId)
          );
        }
      } catch (storageError) {
        console.warn(
          '[Safepay] Could not save payment session data:',
          storageError
        );

        // Do not stop checkout because sessionStorage
        // is unavailable.
      }

      // ------------------------------------------------------
      // OPTIONAL CALLBACK
      // ------------------------------------------------------

      if (
        typeof onCreditsUpdated ===
        'function'
      ) {
        try {
          onCreditsUpdated({
            status: 'PAYMENT_STARTED',
            packageId: validPackage.id,
            trackerToken,
          });
        } catch (callbackError) {
          console.warn(
            '[Safepay] onCreditsUpdated callback error:',
            callbackError
          );
        }
      }

      // ------------------------------------------------------
      // REDIRECT TO SAFEPAY
      // ------------------------------------------------------

      setPaymentStatus({
        text:
          'Opening Safepay checkout...',
        type: 'info',
      });

      // Give React a moment to display the status
      // before navigating away.
      setTimeout(() => {
        window.location.assign(
          parsedCheckoutUrl.toString()
        );
      }, 300);
    } catch (error) {
      console.error(
        '[Safepay] Checkout error:',
        error
      );

      setIsProcessing(false);

      setPaymentStatus({
        text:
          error?.message ||
          'Unable to start Safepay payment.',
        type: 'error',
      });
    }
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal = () => {
    if (isProcessing) {
      return;
    }

    setIsOpen(false);

    setPaymentStatus({
      text: '',
      type: '',
    });
  };

  // ==========================================================
  // OPEN MODAL
  // ==========================================================

  const openModal = () => {
    if (isProcessing) {
      return;
    }

    setPaymentStatus({
      text: '',
      type: '',
    });

    setSelectedPkg(PACKAGES[0]);

    setIsOpen(true);
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {/* ======================================================
          BUY CREDITS BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={openModal}
        disabled={isProcessing}
        style={{
          ...triggerBtnStyle,
          opacity: isProcessing ? 0.6 : 1,
          cursor: isProcessing
            ? 'not-allowed'
            : 'pointer',
        }}
      >
        + Buy Credits ⚡
      </button>

      {/* ======================================================
          MODAL
      ====================================================== */}

      {isOpen && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !isProcessing
            ) {
              closeModal();
            }
          }}
        >
          <div
            style={{
              ...modalStyle,
              padding: isMobile
                ? '16px'
                : '24px',
            }}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            {/* ==================================================
                HEADER
            ================================================== */}

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: '#00f3ff',
                  fontSize: isMobile
                    ? '1.2rem'
                    : '1.4rem',
                }}
              >
                Buy Credits (Safepay)
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={isProcessing}
                style={{
                  ...closeBtnStyle,
                  opacity: isProcessing
                    ? 0.5
                    : 1,
                  cursor: isProcessing
                    ? 'not-allowed'
                    : 'pointer',
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* ==================================================
                USER EMAIL
            ================================================== */}

            <div
              style={{
                marginBottom: '16px',
                padding: '10px 12px',
                borderRadius: '6px',
                background:
                  'rgba(255,255,255,0.04)',
                border:
                  '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                style={{
                  color: '#888',
                  fontSize: '0.72rem',
                  marginBottom: '3px',
                }}
              >
                Payment account
              </div>

              <div
                style={{
                  color: '#ddd',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all',
                }}
              >
                {userEmail ||
                  'No email available'}
              </div>
            </div>

            {/* ==================================================
                PACKAGE SELECTION
            ================================================== */}

            <h4
              style={{
                margin: '0 0 10px 0',
                color: '#fff',
                fontSize: '0.95rem',
              }}
            >
              Select a Package
            </h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  isMobile
                    ? '1fr'
                    : 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              {PACKAGES.map((pkg) => {
                const isSelected =
                  selectedPkg.id === pkg.id;

                return (
                  <button
                    type="button"
                    key={pkg.id}
                    onClick={() => {
                      if (!isProcessing) {
                        setSelectedPkg(pkg);

                        setPaymentStatus({
                          text: '',
                          type: '',
                        });
                      }
                    }}
                    disabled={isProcessing}
                    style={{
                      ...packageCardStyle,

                      border: isSelected
                        ? '1px solid #00f3ff'
                        : '1px solid #222',

                      background: isSelected
                        ? 'rgba(0, 243, 255, 0.1)'
                        : '#0d0d11',

                      boxShadow: isSelected
                        ? '0 0 10px rgba(0, 243, 255, 0.2)'
                        : 'none',

                      opacity: isProcessing
                        ? 0.6
                        : 1,

                      cursor: isProcessing
                        ? 'not-allowed'
                        : 'pointer',
                    }}
                  >
                    <div
                      style={{
                        fontSize: isMobile
                          ? '0.95rem'
                          : '1rem',
                        fontWeight: 'bold',
                        color: '#00f3ff',
                      }}
                    >
                      {pkg.label}
                    </div>

                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: '#aaa',
                        marginTop: '4px',
                      }}
                    >
                      ${pkg.price} USD
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ==================================================
                STATUS
            ================================================== */}

            {paymentStatus.text && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  marginBottom: '16px',

                  background:
                    paymentStatus.type ===
                    'error'
                      ? 'rgba(255, 50, 50, 0.15)'
                      : 'rgba(0, 243, 255, 0.15)',

                  color:
                    paymentStatus.type ===
                    'error'
                      ? '#ff6b6b'
                      : '#00f3ff',

                  border:
                    paymentStatus.type ===
                    'error'
                      ? '1px solid #ff3232'
                      : '1px solid #00f3ff',

                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {paymentStatus.text}
              </div>
            )}

            {/* ==================================================
                CHECKOUT BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={
                handleSafepayCheckout
              }
              disabled={isProcessing}
              style={{
                ...checkoutBtnStyle,

                opacity: isProcessing
                  ? 0.6
                  : 1,

                cursor: isProcessing
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {isProcessing
                ? 'Opening Safepay...'
                : `Pay $${selectedPkg.price} USD via Safepay 💳`}
            </button>

            {/* ==================================================
                SECURITY MESSAGE
            ================================================== */}

            <div
              style={{
                marginTop: '12px',
                textAlign: 'center',
                color: '#777',
                fontSize: '0.72rem',
                lineHeight: '1.4',
              }}
            >
              Secure payment powered by
              Safepay
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// STYLES
// ============================================================

const triggerBtnStyle = {
  background:
    'rgba(0, 243, 255, 0.15)',

  color: '#00f3ff',

  border:
    '1px solid #00f3ff',

  padding:
    '6px 14px',

  borderRadius:
    '20px',

  fontWeight:
    'bold',

  cursor:
    'pointer',

  fontSize:
    '0.85rem',

  transition:
    '0.3s',
};

const overlayStyle = {
  position:
    'fixed',

  top: 0,
  left: 0,
  right: 0,
  bottom: 0,

  backgroundColor:
    'rgba(0, 0, 0, 0.85)',

  display:
    'flex',

  justifyContent:
    'center',

  alignItems:
    'center',

  zIndex:
    1000,

  backdropFilter:
    'blur(4px)',

  padding:
    '12px',
};

const modalStyle = {
  background:
    '#16161a',

  border:
    '1px solid rgba(0, 243, 255, 0.3)',

  borderRadius:
    '12px',

  width:
    '100%',

  maxWidth:
    '480px',

  maxHeight:
    '90vh',

  overflowY:
    'auto',

  boxShadow:
    '0 0 20px rgba(0, 243, 255, 0.2)',

  color:
    '#fff',
};

const closeBtnStyle = {
  background:
    'none',

  border:
    'none',

  color:
    '#aaa',

  fontSize:
    '1.2rem',

  cursor:
    'pointer',

  padding:
    '4px 8px',
};

const packageCardStyle = {
  borderRadius:
    '8px',

  padding:
    '12px 8px',

  textAlign:
    'center',

  cursor:
    'pointer',

  transition:
    'all 0.2s ease-in-out',

  width:
    '100%',

  fontFamily:
    'inherit',
};

const checkoutBtnStyle = {
  width:
    '100%',

  padding:
    '12px',

  background:
    'linear-gradient(90deg, #00f3ff, #0088ff)',

  color:
    '#000',

  border:
    'none',

  borderRadius:
    '8px',

  fontWeight:
    'bold',

  fontSize:
    '0.95rem',
};
