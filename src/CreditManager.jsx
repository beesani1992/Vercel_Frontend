import React, { useState, useEffect } from 'react';

// ============================================================
// PACKAGE CONFIGURATION
// ============================================================

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
  userId = 'usr_123',
  onCreditsUpdated,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedPkg, setSelectedPkg] =
    useState(PACKAGES[0]);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [paymentStatus, setPaymentStatus] =
    useState({
      text: '',
      type: '',
    });

  const [isMobile, setIsMobile] =
    useState(false);


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
  // SAFEPAY CHECKOUT
  // ==========================================================

  const handleSafepayCheckout = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    setPaymentStatus({
      text: 'Creating Safepay sandbox payment...',
      type: 'info',
    });

    try {
      console.log(
        '[Safepay] Creating payment...'
      );

      console.log(
        '[Safepay] Package:',
        selectedPkg
      );

      // ------------------------------------------------------
      // CREATE TRACKER ON YOUR BACKEND
      // ------------------------------------------------------

      const response = await fetch(
        `${BACKEND_URL}/api/payments/create-safepay-tracker`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            amount: selectedPkg.price,
            currency: 'USD',
            packageId: selectedPkg.id,
            userId: userId,
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


      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          'Backend returned invalid JSON: ' +
          responseText
        );
      }


      // ------------------------------------------------------
      // CHECK HTTP ERROR
      // ------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          `Backend error (${response.status})`
        );
      }


      // ------------------------------------------------------
      // CHECK SAFEPAY RESPONSE
      // ------------------------------------------------------

      if (!data.success) {
        throw new Error(
          data.message ||
          'Safepay payment initialization failed.'
        );
      }


      // ------------------------------------------------------
      // TRACKER
      // ------------------------------------------------------

      if (!data.trackerToken) {
        console.error(
          '[Safepay] Full response:',
          data
        );

        throw new Error(
          'Backend did not return trackerToken.'
        );
      }


      const trackerToken =
        data.trackerToken;


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


      if (!checkoutUrl) {
        console.error(
          '[Safepay] Backend response:',
          data
        );

        throw new Error(
          'Backend created the tracker successfully, but did not return a Safepay checkout URL.'
        );
      }


      console.log(
        '[Safepay] Checkout URL received'
      );


      // ------------------------------------------------------
      // SAVE PAYMENT INFORMATION
      // ------------------------------------------------------

      sessionStorage.setItem(
        'safepay_tracker',
        trackerToken
      );

      sessionStorage.setItem(
        'safepay_package',
        selectedPkg.id
      );

      sessionStorage.setItem(
        'safepay_user',
        userId
      );


      // ------------------------------------------------------
      // REDIRECT TO SAFEPAY
      // ------------------------------------------------------

      setPaymentStatus({
        text: 'Opening Safepay checkout...',
        type: 'info',
      });


      setTimeout(() => {
        window.location.href =
          checkoutUrl;
      }, 300);


    } catch (err) {

      console.error(
        '[Safepay] Checkout error:',
        err
      );

      setIsProcessing(false);

      setPaymentStatus({
        text:
          err?.message ||
          'Unable to start Safepay payment.',
        type: 'error',
      });
    }
  };


  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal = () => {
    if (isProcessing) return;

    setIsOpen(false);

    setPaymentStatus({
      text: '',
      type: '',
    });
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
        onClick={() => {
          setIsOpen(true);

          setPaymentStatus({
            text: '',
            type: '',
          });
        }}
        style={triggerBtnStyle}
      >
        + Buy Credits ⚡
      </button>


      {/* ======================================================
          MODAL
      ====================================================== */}

      {isOpen && (
        <div style={overlayStyle}>

          <div
            style={{
              ...modalStyle,
              padding: isMobile
                ? '16px'
                : '24px',
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
                onClick={closeModal}
                disabled={isProcessing}
                style={closeBtnStyle}
              >
                ✕
              </button>

            </div>


            {/* ==================================================
                PACKAGE SELECTION
            ================================================== */}

            <h4
              style={{
                margin:
                  '0 0 10px 0',
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
                  selectedPkg.id ===
                  pkg.id;

                return (

                  <div
                    key={pkg.id}

                    onClick={() => {
                      if (!isProcessing) {
                        setSelectedPkg(pkg);
                      }
                    }}

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

                      opacity:
                        isProcessing
                          ? 0.6
                          : 1,
                    }}
                  >

                    <div
                      style={{
                        fontSize:
                          isMobile
                            ? '0.95rem'
                            : '1rem',

                        fontWeight:
                          'bold',

                        color:
                          '#00f3ff',
                      }}
                    >
                      {pkg.label}
                    </div>


                    <div
                      style={{
                        fontSize:
                          '0.85rem',

                        color:
                          '#aaa',

                        marginTop:
                          '4px',
                      }}
                    >
                      ${pkg.price} USD
                    </div>

                  </div>
                );
              })}

            </div>


            {/* ==================================================
                STATUS
            ================================================== */}

            {paymentStatus.text && (

              <div
                style={{
                  padding:
                    '10px 12px',

                  borderRadius:
                    '6px',

                  fontSize:
                    '0.85rem',

                  marginBottom:
                    '16px',

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

                  whiteSpace:
                    'pre-wrap',
                }}
              >
                {paymentStatus.text}
              </div>
            )}


            {/* ==================================================
                CHECKOUT BUTTON
            ================================================== */}

            <button
              onClick={
                handleSafepayCheckout
              }

              disabled={
                isProcessing
              }

              style={{
                ...checkoutBtnStyle,

                opacity:
                  isProcessing
                    ? 0.6
                    : 1,

                cursor:
                  isProcessing
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {isProcessing
                ? 'Opening Safepay...'
                : `Pay $${selectedPkg.price} USD via Safepay 💳`}
            </button>


            <div
              style={{
                marginTop: '12px',
                textAlign: 'center',
                color: '#777',
                fontSize: '0.72rem',
              }}
            >
              Secure payment powered by Safepay
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

  color:
    '#00f3ff',

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
