import React, { useState } from 'react';

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [loadingState, setLoadingState] = useState({ active: false, message: '' });
  const [cartoonData, setCartoonData] = useState('');

  const handleVideoSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setCartoonData('');
    }
  };

  const startTransformation = async () => {
    if (!videoFile) return alert('Select an MP4/MOV video first.');

    const payload = new FormData();
    payload.append('video', videoFile);

    setLoadingState({ active: true, message: 'Uploading video to Gemini engine...' });

    try {
      const response = await fetch('http://localhost:5000/api/process-video', {
        method: 'POST',
        body: payload,
      });

      const data = await response.json();

      if (data.success) {
        setLoadingState({ active: false, message: '' });
        setCartoonData(data.cartoonBlueprint);
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
        <h1 style={styles.title}>✨ Video-to-Cartoon Studio</h1>
        <p style={styles.subtitle}>Powered by Google Gemini Multimodal Engine</p>
      </header>

      <main style={styles.mainGrid}>
        {/* Left Column: Upload and Input Preview */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>1. Upload Video Source</h2>
          <div style={styles.dropZone}>
            <input type="file" accept="video/*" onChange={handleVideoSelection} style={styles.fileInput} />
            <p>Drag video here or click to browse</p>
          </div>

          {videoPreview && (
            <div style={styles.previewContainer}>
              <h3 style={styles.label}>Source Preview:</h3>
              <video src={videoPreview} controls style={styles.videoPlayer} />
            </div>
          )}

          <button 
            onClick={startTransformation} 
            disabled={loadingState.active || !videoFile}
            style={{...styles.actionBtn, opacity: (loadingState.active || !videoFile) ? 0.6 : 1}}
          >
            {loadingState.active ? 'Processing Architecture...' : 'Generate Cartoon Blueprint'}
          </button>
          
          {loadingState.active && <p style={styles.loadingText}>⏳ {loadingState.message}</p>}
        </section>

        {/* Right Column: Cartoon Blueprint Output */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>2. Stylized Target Generation</h2>
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
    </div>
  );
}

// Minimalist Dashboard Styling Rules
const styles = {
  appContainer: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', fontFamily: '"Inter", sans-serif', color: '#1F2937' },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '2.5rem', fontWeight: '800', color: '#4F46E5', margin: '0 0 8px 0' },
  subtitle: { fontSize: '1.1rem', color: '#6B7280', margin: 0 },
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