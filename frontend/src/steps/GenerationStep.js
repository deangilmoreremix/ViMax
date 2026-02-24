/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import './GenerationStep.css';

const STEP_ICONS = {
  completed: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#10b981" />
      <path d="M4.5 8L6.5 10.5L11.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  in_progress: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1.5s linear infinite' }}>
      <circle cx="8" cy="8" r="6" stroke="#3b82f6" strokeWidth="2" strokeDasharray="20 18" />
    </svg>
  ),
  pending: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="#d1d5db" strokeWidth="2" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#ef4444" />
      <path d="M5 5l6 6M11 5l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export default function GenerationStep({ jobStatus, jobId, scenes, wsStatus, onCancel }) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = jobStatus?.progress || 0;
  const steps = jobStatus?.steps || [];
  const status = jobStatus?.status || 'processing';
  const message = jobStatus?.message || 'Initializing AI pipeline...';
  const currentStep = jobStatus?.current_step || '';

  return (
    <div className="generation-step animate-fade-in-up">
      <div className="generation-header">
        <div className="generation-header-left">
          <h2 className="generation-title">
            {status === 'completed' ? 'Video Ready!' : 'Generating Your Video'}
          </h2>
          <p className="generation-subtitle">{message}</p>
        </div>
        <div className="generation-header-right">
          <div className={`ws-status ${wsStatus}`}>
            <span className="ws-dot" />
            {wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting' : 'Offline'}
          </div>
          <span className="generation-elapsed">{formatTime(elapsed)}</span>
        </div>
      </div>

      <div className="generation-progress-block">
        <div className="generation-progress-bar">
          <div
            className={`generation-progress-fill ${status === 'completed' ? 'completed' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="generation-progress-info">
          <span className="generation-progress-pct">{progress}%</span>
          {currentStep && <span className="generation-current-step">{currentStep}</span>}
        </div>
      </div>

      {steps.length > 0 && (
        <div className="generation-steps">
          {steps.map((step, i) => (
            <div key={i} className={`generation-step-row ${step.status}`}>
              <div className="generation-step-icon">
                {STEP_ICONS[step.status] || STEP_ICONS.pending}
              </div>
              <div className="generation-step-info">
                <span className="generation-step-name">{step.name}</span>
                {step.estimated_time && (
                  <span className="generation-step-time">~{step.estimated_time}s</span>
                )}
              </div>
              {step.status === 'in_progress' && (
                <div className="generation-step-pulse" />
              )}
            </div>
          ))}
        </div>
      )}

      {scenes && scenes.length > 0 && (
        <div className="generation-scenes">
          <h3 className="generation-scenes-title">Scene Previews</h3>
          <div className="generation-scenes-grid">
            {scenes.map((scene, i) => (
              <div key={i} className={`generation-scene-card ${scene.status}`}>
                {scene.image_url ? (
                  <img src={scene.image_url} alt={`Scene ${i + 1}`} className="generation-scene-img" />
                ) : (
                  <div className="generation-scene-placeholder">
                    {scene.status === 'generating' ? (
                      <div className="generation-scene-spinner" />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M9.5 9l5 3-5 3V9Z" fill="currentColor" />
                      </svg>
                    )}
                  </div>
                )}
                <div className="generation-scene-label">
                  <span>Scene {i + 1}</span>
                  {scene.duration_seconds && <span>{scene.duration_seconds}s</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="generation-error">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#ef4444" strokeWidth="1.5" />
            <path d="M10 6v5M10 13v1" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <p className="generation-error-title">Generation failed</p>
            <p className="generation-error-desc">{jobStatus?.error_message || 'An unexpected error occurred. Please try again.'}</p>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <button className="generation-cancel-btn" onClick={onCancel}>
          Cancel generation
        </button>
      )}
    </div>
  );
}
