import React, { useState } from 'react';
import CopyScriptButton from './components/CopyScriptButton';
import PaymentDetailsModal from './components/PaymentDetailsModal';

// Accept credits and useCredit props passed down from AppWrapper
function App({ credits, useCredit, userId }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoDuration, setVideoDuration] = useState(0); // Holds video length in seconds
  const [loadingState, setLoadingState] = useState({ active: false, message: '' });
  const [cartoonData, setCartoonData] = useState('');

  // PAYMENT MODAL STATE
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Quick Credit Packages definition
  const creditPackages = [
    { id: 'pack_100', credits: 100, price: 5 },
    { id: 'pack_500', credits: 500, price: 20 },
    { id: 'pack_1500', credits: 1500, price: 50 },
  ];

  const handleOpenPayment = (pkg) => {
    setSelectedPackage(pkg);
    setIsPaymentModalOpen(true);
  };

  const handleVideoSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setCartoonData('');
    }
  };

  // Automatically captures the video duration when metadata loads
  const handleLoadedMetadata = (e) => {
    const durationInSeconds = Math.ceil(e.target.duration);
    setVideoDuration(durationInSeconds);
  };

  const startTransformation = async () => {
    if (!videoFile) return alert('Select an MP4/MOV video first.');

    // 1. Calculate required credits: 5 credits per second
    const requiredCredits = videoDuration * 5;

    // 2. Pre-check if user has enough credits
    if (credits < requiredCredits) {
      return alert(
        `Insufficient credits! This ${videoDuration}-second video requires ${requiredCredits} credits (5 credits/sec). You currently have ${credits} credits.`
      );
    }

    const payload = new FormData();
    payload.append('video', videoFile);

    setLoadingState({ active: true, message: 'Uploading video & generating script via Gemini engine...' });

    try {
      const response = await fetch('https://vercel-backend-two-umber.vercel.app/api/process-video', {
        method: 'POST',
        body: payload,
      });

      const data = await response.json();

      if (data.success) {
        setLoadingState({ active: true, message: `Script generated! Finalizing deduction of ${requiredCredits} credits...` });
        
        const success = await useCredit(requiredCredits);

        if (!success) {
          throw new Error('Credit deduction failed. Please contact support.');
        }

        setCartoonData(data.cartoonBlueprint);
        setLoadingState({ active: false, message: '' });
      } else {
        throw new Error(data.error || 'Pipeline breakdown.');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
      setLoadingState({ active: false, message: '' });
    }
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>✨ Video-to-Script</h1>
        <p style={styles.subtitle}>Powered by Google Gemini</p>
        
        {/* TOP BAR CREDIT COUNTER & BUY CREDITS BUTTONS */}
        <div style={styles.creditsBar}>
          <div style={styles.creditInfoBox}>
            <span style={{ fontSize: '1.2rem' }}>💳</span>
            <span style={styles.creditText}>
              Available Credits: <strong style={{ color: '#4F46E5', fontSize: '1.2rem' }}>{credits ?? 0}</strong>
            </span>
          </div>

          <div style={styles.pkgButtonGroup}>
            {creditPackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleOpenPayment(pkg)}
                style={styles.paymentDetailsBtn}
              >
                📝 Submit Payment Details
                <span style={styles.priceTag}>${pkg.price} for {pkg.credits} C</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={styles.mainGrid}>
        {/* Left Column: Upload and Input Preview */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Step-1. Upload Video Source</h2>
          <div style={styles.dropZone}>
            <input type="file" accept="video/*" onChange={handleVideoSelection} style={styles.fileInput} />
            <p>Drag video here or click to browse</p>
          </div>

          {videoPreview && (
            <div style={styles.previewContainer}>
              <h3 style={styles.label}>Source Preview:</h3>
              <video 
                src={videoPreview} 
                controls 
                onLoadedMetadata={handleLoadedMetadata}
                style={styles.videoPlayer} 
              />
              {videoDuration > 0 && (
                <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#4F46E5', fontWeight: '600' }}>
                  ⏱️ Length: {videoDuration} seconds | ⚡ Cost: {videoDuration * 5} Credits
                </p>
              )}
            </div>
          )}

          <button 
            onClick={startTransformation} 
            disabled={loadingState.active || !videoFile}
            style={{...styles.actionBtn, opacity: (loadingState.active || !videoFile) ? 0.6 : 1}}
          >
            {loadingState.active ? 'Processing Architecture...' : 'Generate Script'}
          </button>
          
          {loadingState.active && <p style={styles.loadingText}>⏳ {loadingState.message}</p>}
        </section>

        {/* Right Column: Cartoon Blueprint Output */}
        <section style={styles.card}>
          {/* Header flexbox containing Title and Copy Component */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #F3F4F6', paddingBottom: '10px' }}>
            <h2 style={{ ...styles.cardTitle, borderBottom: 'none', paddingBottom: 0, margin: 0 }}>Step-2. Target Script Generation</h2>
            
            {/* COPY BUTTON COMPONENT */}
            <CopyScriptButton textToCopy={cartoonData} />
          </div>
          {cartoonData ? (
            <div style={styles.outputBox}>
              <pre style={styles.preformattedText}>{cartoonData}</pre>
            </div>
          ) : (
            <div style={styles.placeholderBox}>
              <p>Your AI-generated artistic interpretation and keyframe prompts will populate here.</p>
            </div>
          )}
        </section>
      </main>

      {/* MODAL COMPONENT */}
      <PaymentDetailsModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedPackage={selectedPackage}
        userId={userId}
      />
    </div>
  );
}

// Fixed Dashboard Styling Rules
const styles = {
  appContainer: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', fontFamily: '"Inter", sans-serif', color: '#1F2937' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '2.5rem', fontWeight: '800', color: '#4F46E5', margin: '0 0 8px 0' },
  subtitle: { fontSize: '1.1rem', color: '#6B7280', margin: '0 0 24px 0' },
  creditsBar: { background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px 24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  creditInfoBox: { display: 'flex', alignItems: 'center', gap: '8px' },
  creditText: { margin: 0, fontSize: '1rem', color: '#334155', fontWeight: '500' },
  pkgButtonGroup: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  paymentDetailsBtn: { padding: '10px 16px', background: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)', transition: 'transform 0.1s ease' },
  priceTag: { background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' },
  card: { background: '#FFFFFF', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  cardTitle: { fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', borderBottom: '2px solid #F3F4F6', paddingBottom: '10px' },
  dropZone: { border: '2px dashed #64748B', borderRadius: '8px', padding: '30px', textAlign: 'center', cursor: 'pointer', background: '#F8FAFC', position: 'relative' },
  fileInput: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' },
  previewContainer: { marginTop: '20px' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: '#4B5563' },
  videoPlayer: { width: '100%', borderRadius: '6px', marginTop: '5px' },
  actionBtn: { width: '100%', padding: '14px', background: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '20px', transition: 'all 0.2s' },
  loadingText: { color: '#4F46E5', textAlign: 'center', fontWeight: '500', marginTop: '10px' },
  outputBox: { background: '#0F172A', color: '#38BDF8', padding: '20px', borderRadius: '8px', overflowX: 'auto', maxHeight: '500px' },
  preformattedText: { whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: '1.5' },
  placeholderBox: { border: '2px dashed #E5E7EB', borderRadius: '8px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', color: '#9CA3AF' }
};

export default App;
