import React, { useEffect, useRef, useState } from "react";

const BACKEND_URL =
  "https://vercel-backend-two-umber.vercel.app";

const VERIFY_URL =
  `${BACKEND_URL}/api/payments/verify-safepay-payment`;

export default function PaymentSuccess({ onCreditsUpdated }) {
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState(
    "Please wait while we verify your payment."
  );

  const started = useRef(false);

  useEffect(() => {
    // Avoid duplicate verification during React Strict Mode.
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    async function verifyPayment() {
      try {
        const params = new URLSearchParams(window.location.search);

        // Prefer a tracker returned in the URL; otherwise use
        // the tracker saved before redirecting to Safepay.
        const trackerToken =
          params.get("tracker") ||
          params.get("trackerToken") ||
          sessionStorage.getItem("safepay_tracker");

        if (!trackerToken) {
          throw new Error(
            "Payment reference not found. Please contact support."
          );
        }

        const response = await fetch(VERIFY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trackerToken }),
        });

        const result = await response.json();

        if (!response.ok || result.success !== true) {
          throw new Error(
            result.message ||
              "We could not verify your payment yet."
          );
        }

        // Adapt these fields to the exact response returned by
        // your backend verification controller.
        const paymentStatus = String(
          result.paymentStatus ||
          result.status ||
          ""
        ).toLowerCase();

        if (
          result.verified === false ||
          result.paid === false ||
          ["pending", "failed", "cancelled", "canceled"].includes(
            paymentStatus
          )
        ) {
          if (!cancelled) {
            setStatus("pending");
            setMessage(
              "Your payment is not confirmed yet. Please check again shortly."
            );
          }
          return;
        }

        if (cancelled) return;

        setStatus("success");
        setMessage(
          "Your payment has been verified successfully."
        );

        // Notify the existing credits UI to reload its balance.
        if (typeof onCreditsUpdated === "function") {
          onCreditsUpdated({
            status: "PAYMENT_SUCCESS",
            trackerToken,
            packageId: sessionStorage.getItem("safepay_package"),
          });
        }

        // Clear checkout details only after successful verification.
        sessionStorage.removeItem("safepay_tracker");
        sessionStorage.removeItem("safepay_package");
        sessionStorage.removeItem("safepay_user");
        sessionStorage.removeItem("safepay_order_id");
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error.message ||
              "An error occurred while checking your payment."
          );
        }
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [onCreditsUpdated]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#07111f",
        color: "#eaf6ff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "36px 26px",
          border: "1px solid #1e3b50",
          borderRadius: "18px",
          background: "#0d1b2a",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "16px",
          }}
        >
          {status === "verifying"
            ? "⏳"
            : status === "success"
            ? "✅"
            : status === "pending"
            ? "🕒"
            : "⚠️"}
        </div>

        <h1 style={{ fontSize: "26px", marginBottom: "14px" }}>
          {status === "verifying"
            ? "Verifying Payment"
            : status === "success"
            ? "Payment Successful"
            : status === "pending"
            ? "Payment Pending"
            : "Payment Verification"}
        </h1>

        <p
          style={{
            color: "#b8c9d9",
            lineHeight: 1.7,
            overflowWrap: "anywhere",
          }}
        >
          {message}
        </p>

        {status === "verifying" && (
          <p style={{ color: "#53d8fb", fontSize: "13px" }}>
            Please do not close this page.
          </p>
        )}

        {status === "success" && (
          <button
            onClick={() => {
              window.location.assign("/");
            }}
            style={buttonStyle}
          >
            Return to App
          </button>
        )}

        {(status === "pending" || status === "error") && (
          <div>
            <button
              onClick={() => window.location.reload()}
              style={buttonStyle}
            >
              Check Again
            </button>

            <p style={{ color: "#93a7b8", fontSize: "12px" }}>
              Do not purchase again until you have checked the
              status of your existing payment.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

const buttonStyle = {
  width: "100%",
  marginTop: "20px",
  padding: "14px 18px",
  border: "none",
  borderRadius: "9px",
  background: "#53d8fb",
  color: "#07111f",
  fontWeight: "bold",
  fontSize: "15px",
  cursor: "pointer",
};
