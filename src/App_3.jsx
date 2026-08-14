import React, { useState } from 'react';

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [loadingState, setLoadingState] = useState({ active: false, message: '' });
  const [outputVideo, setOutputVideo] = useState('');

  const handleVideoSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setOutputVideo('');
    }
  };

  const startTransformation = async () => {
    if (!videoFile) return alert('Select a video file first.');

    const payload = new FormData();
    payload.append('video', videoFile);

    setLoadingState({ active: true, message: 'Executing video split and canvas render matrix...' });

    try {
      const response = await fetch('http://localhost:5000/api/process-video', {
        method: 'POST',
        body: payload,
      });

      const data = await response.json();

      if (data.success) {
        setLoadingState({ active: false, message: '' });
        setOutputVideo(data.videoUrl);
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
        <h1 style={styles.title}>🎬 Video-to-Cartoon Studio</h1>
        <p style={styles.subtitle}>Direct Image Processing & Frame Reconstruction Dashboard</p>
      </header>

      <main style={styles.mainGrid}>
        {/* Left Card: Input Sources */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>1. Input Video Feed</h2>
          <div style={styles.dropZone}>
            <input type="file" accept="video/*" onChange={handleVideoSelection} style={styles.fileInput} />
            <p>Drag video here or click to swap video source</p>
          </div>

          {videoPreview && (
            <div style={styles.previewContainer}>
              <h3 style={styles.label}>Original Track:</h3>
              <video src={videoPreview} controls style={styles.videoPlayer} />
            </div>
          )}

          <button 
            onClick={startTransformation} 
            disabled={loadingState.active || !videoFile}
            style={{...styles.actionBtn, opacity: (loadingState.active || !videoFile) ? 0.6 : 1}}
          >
            {loadingState.active ? 'Processing Frames...' : 'Compile Cartoon Video'}
          </button>
          
          {loadingState.active && <p style={styles.loadingText}>⏳ {loadingState.message}</p>}
        </section>

        {/* Right Card: Render Output Monitor */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>2. Cartoon Video Output</h2>
          {outputVideo ? (
            <div style={styles.previewContainer}>
              <h3 style={styles.label}>Stylized Result:</h3>
              <video src={outputVideo} controls autoPlay style={styles.videoPlayer} />
              <a href={outputVideo} download style={styles.downloadLink}>💾 Save Cartoon Video</a>
            </div>
          ) : (
            <div style={styles.placeholderBox}>
              <p>Your finished compiled video will stream here once the rendering loop completes.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  appContainer: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', fontFamily: '"Inter", sans-serif', color: '#1F2937' },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '2.5rem', fontWeight: '800', color: '#10B981', margin: '0 0 8px 0' },
  subtitle: { fontSize: '1.1rem', color: '#6B7280', margin: 0 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' },
  card: { background: '#FFFFFF', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  cardTitle: { fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', borderBottom: '2px solid #F3F4F6', paddingBottom: '10px' },
  dropZone: { border: '2px dashed #10B981', borderRadius: '8px', padding: '30px', textAlign: 'center', cursor: 'pointer', background: '#F0FDF4', position: 'relative' },
  fileInput: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' },
  previewContainer: { marginTop: '20px', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: '#4B5563', marginBottom: '5px' },
  videoPlayer: { width: '100%', borderRadius: '6px', background: '#000' },
  actionBtn: { width: '100%', padding: '14px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '20px' },
  loadingText: { color: '#10B981', textAlign: 'center', fontWeight: '500', marginTop: '10px' },
  downloadLink: { marginTop: '15px', padding: '12px', background: '#111827', color: '#FFF', textAlign: 'center', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' },
  placeholderBox: { border: '2px dashed #E5E7EB', borderRadius: '8px', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', color: '#9CA3AF' }
};

export default App;