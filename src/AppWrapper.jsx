import React, { useState, useEffect, useCallback } from 'react';
import App from './App';
import AuthPage from './AuthPage';
import Profile from './Profile';
import CreditManager from './CreditManager';

const BACKEND_URL =
  'https://vercel-backend-two-umber.vercel.app';

/*
 * Safely read the payload of a JWT.
 * This does NOT verify the token.
 * The backend remains responsible for token verification.
 */
const getEmailFromToken = (token) => {
  if (!token || typeof token !== 'string') {
    return '';
  }

  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return '';
    }

    const base64Url = parts[1];

    const base64 = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );

    const decoded = decodeURIComponent(
      atob(padded)
        .split('')
        .map(
          (char) =>
            `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`
        )
        .join('')
    );

    const payload = JSON.parse(decoded);

    const email =
      payload.email ||
      payload.userEmail ||
      payload.user_email ||
      '';

    return typeof email === 'string'
      ? email.trim().toLowerCase()
      : '';
  } catch (error) {
    console.error('[Auth] Unable to read email from token:', error);
    return '';
  }
};

export default function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState('app');
  const [credits, setCredits] = useState(0);
  const [userEmail, setUserEmail] = useState('');

  /*
   * Get the currently logged-in user's email.
   *
   * Your login system stores the authentication JWT in:
   * localStorage.token
   *
   * The JWT payload is read only to obtain the email for the
   * Safepay payment request.
   */
  const loadUserEmail = useCallback(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUserEmail('');
      return '';
    }

    const email = getEmailFromToken(token);

    if (email) {
      setUserEmail(email);
      console.log('[Auth] Logged-in user email:', email);
    } else {
      console.error(
        '[Auth] No email found inside authentication token.'
      );
      setUserEmail('');
    }

    return email;
  }, []);

  /*
   * Fetch current credit balance.
   */
  const fetchCredits = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setCredits(0);
      return;
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/auth/credits`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        const currentCredits = Number(data.credits);

        setCredits(
          Number.isFinite(currentCredits)
            ? currentCredits
            : 0
        );

        console.log(
          '[Credits] Current balance:',
          currentCredits
        );
      } else {
        console.error(
          '[Credits] Failed to fetch balance:',
          data
        );
      }
    } catch (err) {
      console.error(
        '[Credits] Failed to fetch credits:',
        err
      );
    }
  }, []);

  /*
   * Load authentication state when the application starts.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsAuthenticated(false);
      setUserEmail('');
      setCredits(0);
      return;
    }

    setIsAuthenticated(true);

    loadUserEmail();
    fetchCredits();
  }, [loadUserEmail, fetchCredits]);

  /*
   * Use credits from the logged-in account.
   */
  const handleUseCredit = async (amount = 1) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please log in again.');
      setIsAuthenticated(false);
      return false;
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/auth/use-credit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify({ amount }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        const remainingCredits = Number(
          data.remainingCredits
        );

        setCredits(
          Number.isFinite(remainingCredits)
            ? remainingCredits
            : 0
        );

        return true;
      }

      alert(
        data.message ||
          data.error ||
          'Error using credit'
      );

      return false;
    } catch (error) {
      console.error(
        '[Credits] Error using credit:',
        error
      );

      alert(
        'Unable to use credit. Please try again.'
      );

      return false;
    }
  };

  /*
   * Called by CreditManager.
   *
   * CreditManager sends an object such as:
   * {
   *   status: 'PAYMENT_STARTED',
   *   packageId: '100_credits',
   *   trackerToken: '...'
   * }
   *
   * We do NOT treat that object as the credit balance.
   * Instead, refresh the balance from the backend.
   */
  const handleCreditsUpdated = useCallback(
    async (paymentInfo) => {
      console.log(
        '[Payment] CreditManager event:',
        paymentInfo
      );

      /*
       * If CreditManager directly supplies a numeric balance,
       * accept it.
       */
      if (typeof paymentInfo === 'number') {
        setCredits(paymentInfo);
        return;
      }

      /*
       * For payment events, refresh the actual balance.
       */
      if (
        paymentInfo &&
        typeof paymentInfo === 'object'
      ) {
        await fetchCredits();
      }
    },
    [fetchCredits]
  );

  /*
   * Logout.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');

    /*
     * Remove any locally stored payment information.
     */
    try {
      sessionStorage.removeItem('safepay_tracker');
      sessionStorage.removeItem('safepay_package');
      sessionStorage.removeItem('safepay_user');
      sessionStorage.removeItem('safepay_order_id');
    } catch (error) {
      console.warn(
        '[Logout] Could not clear payment session:',
        error
      );
    }

    setUserEmail('');
    setCredits(0);
    setIsAuthenticated(false);
    setView('app');
  };

  /*
   * Login success handler.
   */
  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);

    /*
     * Give React a moment to ensure the token written by
     * AuthPage is available in localStorage.
     */
    const email = loadUserEmail();

    console.log(
      '[Auth] Login successful.',
      email
        ? `Email: ${email}`
        : 'No email found in token.'
    );

    await fetchCredits();
  };

  if (!isAuthenticated) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#0a0a0a',
        minHeight: '100vh',
        color: '#fff',
      }}
    >
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          padding: '15px 30px',
          background: '#111',
          borderBottom:
            '1px solid rgba(0, 243, 255, 0.2)',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setView('app')}
          style={navBtnStyle}
        >
          Main App
        </button>

        <button
          type="button"
          onClick={() => setView('profile')}
          style={navBtnStyle}
        >
          Profile
        </button>

        {/* CREDIT MANAGER & DISPLAY */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid #00f3ff',
              boxShadow:
                '0 0 10px rgba(0, 243, 255, 0.3)',
              color: '#00f3ff',
              fontWeight: 'bold',
            }}
          >
            ⚡ Credits: {credits}
          </div>

          <CreditManager
            userEmail={userEmail}
            onCreditsUpdated={handleCreditsUpdated}
          />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            ...navBtnStyle,
            borderColor: '#ff0055',
            color: '#ff0055',
          }}
        >
          Logout
        </button>
      </nav>

      <main style={{ padding: '20px' }}>
        {view === 'app' ? (
          <App
            credits={credits}
            useCredit={handleUseCredit}
          />
        ) : (
          <Profile credits={credits} />
        )}
      </main>
    </div>
  );
}

const navBtnStyle = {
  background: 'transparent',
  color: '#fff',
  border:
    '1px solid rgba(255,255,255,0.2)',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: '0.3s',
};
