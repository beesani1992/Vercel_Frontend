import React, { useEffect, useState } from 'react';
import CopyScriptButton from './components/CopyScriptButton';
import './App.css';

function App({ credits, useCredit, userId }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [loadingState, setLoadingState] = useState({
    active: false,
    message: '',
  });
  const [cartoonData, setCartoonData] = useState('');

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  const handleVideoSelection = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      e.target.value = '';
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideoDuration(0);
    setCartoonData('');
  };

  const handleLoadedMetadata = (e) => {
    const duration = e.currentTarget.duration;

    if (Number.isFinite(duration) && duration > 0) {
      setVideoDuration(Math.ceil(duration));
    } else {
      setVideoDuration(0);
    }
  };

  const startTransformation = async () => {
    if (!videoFile) {
      alert('Select an MP4/MOV video first.');
      return;
    }

    if (!videoDuration) {
      alert('Please wait until the video duration has loaded.');
      return;
    }

    if (videoDuration >= 60) {
      alert('Please select a video shorter than 60 seconds.');
      return;
    }

    const requiredCredits = videoDuration * 5;
    const availableCredits = Number(credits ?? 0);

    if (availableCredits < requiredCredits) {
      alert(
        `Insufficient credits! This ${videoDuration}-second video requires ` +
        `${requiredCredits} credits. You currently have ${availableCredits} credits.`
      );
      return;
    }

    const payload = new FormData();
    payload.append('video', videoFile);

    setLoadingState({
      active: true,
      message: 'Uploading video and generating your script...',
    });

    try {
      const response = await fetch(
        'https://vercel-backend-two-umber.vercel.app/api/process-video',
        {
          method: 'POST',
          body: payload,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Video processing failed.');
      }

      if (!data.cartoonBlueprint) {
        throw new Error('The server returned an empty script.');
      }

      setLoadingState({
        active: true,
        message: `Script generated. Deducting ${requiredCredits} credits...`,
      });

      const success = await useCredit(requiredCredits);

      if (!success) {
        throw new Error(
          'Credit deduction failed. Please contact support before retrying.'
        );
      }

      setCartoonData(data.cartoonBlueprint);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingState({ active: false, message: '' });
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <img
            src="/favicon.png"
            alt="Video-to-Script logo"
            className="app-logo"
          />
          <h1 className="app-title">Video-to-Script</h1>
        </div>

        <p className="app-subtitle">
          Turn your videos into AI-powered scripts
        </p>

        <span className="powered-badge">✦ Powered by AI</span>

        <div className="credits-bar">
          <div className="credit-info-box">
            <span className="credit-icon">💳</span>
            <div className="credit-info">
              <span className="credit-label">Available Credits</span>
              <strong className="credit-count">
                {credits ?? 0}
              </strong>
            </div>
          </div>

          <div className="credit-rate">
            <span>5 credits</span>
            <span className="rate-divider">/</span>
            <span>second of video</span>
          </div>
        </div>

        <section className="instruction-box">
          <h2 className="instruction-title">📖 How It Works</h2>

          <ol className="instruction-list">
            <li>
              <strong>Upload Video</strong>
              <span>
                Select an MP4, MOV, or other supported video file.
              </span>
            </li>
            <li>
              <strong>Check Duration</strong>
              <span>
                Videos must be shorter than 60 seconds. Each second costs
                5 credits.
              </span>
            </li>
            <li>
              <strong>Generate Script</strong>
              <span>
                Generate your scene-by-scene script using AI.
              </span>
            </li>
          </ol>
        </section>
      </header>

      <main className="main-grid">
        <section className="dashboard-card">
          <div className="card-heading">
            <span className="step-number">01</span>
            <div>
              <h2 className="card-title">Upload Video Source</h2>
              <p className="card-description">
                Select a video to begin.
              </p>
            </div>
          </div>

          <label className="drop-zone">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoSelection}
              className="file-input"
              disabled={loadingState.active}
            />

            <span className="upload-icon">↑</span>
            <span className="upload-title">
              {videoFile ? 'Choose another video' : 'Select your video'}
            </span>
            <span className="upload-description">
              Click to browse your files
            </span>
            <span className="file-formats">
              MP4 · MOV · Under 60 seconds
            </span>
          </label>

          {videoFile && (
            <div className="selected-file">
              <span className="file-icon">▶</span>
              <div className="file-details">
                <span className="file-name">{videoFile.name}</span>
                <span className="file-size">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>
          )}

          {videoPreview && (
            <div className="preview-container">
              <h3 className="section-label">Source Preview</h3>

              <video
                src={videoPreview}
                controls
                playsInline
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata}
                className="video-player"
              />

              {videoDuration > 0 && (
                <div className="video-cost">
                  <span>Duration: {videoDuration} sec</span>
                  <span>
                    Estimated cost: {videoDuration * 5} credits
                  </span>
                </div>
              )}

              {videoDuration >= 60 && (
                <p className="validation-message">
                  Please choose a video shorter than 60 seconds.
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={startTransformation}
            disabled={
              loadingState.active ||
              !videoFile ||
              !videoDuration ||
              videoDuration >= 60
            }
            className="action-button"
          >
            {loadingState.active ? (
              <>
                <span className="spinner" />
                Processing Video...
              </>
            ) : (
              '✦ Generate Script'
            )}
          </button>

          {loadingState.active && (
            <p className="loading-text" role="status">
              {loadingState.message}
            </p>
          )}
        </section>

        <section className="dashboard-card output-card">
          <div className="card-heading output-heading">
            <span className="step-number">02</span>

            <div className="output-heading-text">
              <h2 className="card-title">Target Script Generation</h2>
              <p className="card-description">
                Your generated script appears here.
              </p>
            </div>

            <div className="copy-button-wrapper">
              <CopyScriptButton textToCopy={cartoonData} />
            </div>
          </div>

          {cartoonData ? (
            <div className="output-box">
              <pre className="preformatted-text">{cartoonData}</pre>
            </div>
          ) : (
            <div className="placeholder-box">
              <span className="placeholder-icon">✧</span>
              <h3>Your script will appear here</h3>
              <p>
                Upload a video and generate your AI-powered artistic
                interpretation and keyframe prompts.
              </p>
              <span className="waiting-badge">
                Awaiting video processing
              </span>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        Video-to-Script <span>·</span> AI-powered video workflow
      </footer>
    </div>
  );
}

export default App;
