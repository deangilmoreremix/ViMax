/* eslint-disable */
import React, { useState } from 'react';
import './ResultStep.css';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

const FOLLOW_UP_QUESTIONS = {
  1: "What disappointed you most about this video?",
  2: "What could we improve to make it better?",
  3: "What one thing would you change?",
  4: "What would make it a 5-star video?",
  5: "What did you love most about this video?",
};

export default function ResultStep({ jobId, onStartNew, onSubmitFeedback }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [format, setFormat] = useState('mp4');

  const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const videoUrl = jobId ? `${apiBase}/job/${jobId}/download` : null;

  const handleSubmitFeedback = async () => {
    if (!rating) return;
    try {
      await onSubmitFeedback({ rating, comments: comment, followUpAnswer: followUp });
      setFeedbackSubmitted(true);
    } catch {}
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `vimax_video_${jobId}.${format}`;
      link.click();
    }
  };

  return (
    <div className="result-step animate-fade-in-up">
      <div className="result-header">
        <div className="result-header-badge">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="8" fill="#10b981" />
            <path d="M4.5 8L6.5 10.5L11.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Video complete
        </div>
        <h2 className="result-title">Your Video is Ready</h2>
        <p className="result-subtitle">Review, edit, and download your AI-generated video below.</p>
      </div>

      <div className="result-video-wrapper">
        {videoUrl ? (
          <video
            className="result-video-player"
            controls
            src={videoUrl}
            playsInline
          />
        ) : (
          <div className="result-video-placeholder">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M18 16l14 8-14 8V16Z" fill="currentColor" />
            </svg>
            <span>Video preview unavailable</span>
          </div>
        )}
      </div>

      <div className="result-actions">
        <div className="result-format-row">
          <span className="result-format-label">Download as:</span>
          {['mp4', 'webm', 'mov'].map((f) => (
            <button
              key={f}
              className={`result-format-btn ${format === f ? 'active' : ''}`}
              onClick={() => setFormat(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="result-download-btn" onClick={handleDownload} disabled={!videoUrl}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3v8M5 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Download Video
        </button>
        <button className="result-new-btn" onClick={onStartNew}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Video
        </button>
      </div>

      {!feedbackSubmitted ? (
        <div className="result-feedback">
          <h3 className="result-feedback-title">How did we do?</h3>
          <p className="result-feedback-desc">Your feedback helps us improve the AI for everyone.</p>

          <div className="result-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`result-star ${(hoverRating || rating) >= star ? 'lit' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                title={STAR_LABELS[star]}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M14 3l2.8 8.4H24l-7 5.1 2.7 8.4-7-5.1-7 5.1 2.7-8.4-7-5.1h7.2L14 3Z"
                    fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                    stroke={(hoverRating || rating) >= star ? '#f59e0b' : '#d1d5db'}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
            {(hoverRating || rating) > 0 && (
              <span className="result-star-label">{STAR_LABELS[hoverRating || rating]}</span>
            )}
          </div>

          {rating > 0 && (
            <div className="result-feedback-fields animate-fade-in-up">
              <div className="result-feedback-group">
                <label className="result-feedback-label">{FOLLOW_UP_QUESTIONS[rating]}</label>
                <textarea
                  className="result-feedback-textarea"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Your answer..."
                  rows={2}
                />
              </div>
              <div className="result-feedback-group">
                <label className="result-feedback-label">Any other comments? <span className="result-optional">(optional)</span></label>
                <textarea
                  className="result-feedback-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you think..."
                  rows={3}
                />
              </div>
              <button className="result-feedback-submit" onClick={handleSubmitFeedback}>
                Submit Feedback
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="result-feedback-thanks">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#10b981" />
            <path d="M7 12l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>Thank you for your feedback!</p>
        </div>
      )}
    </div>
  );
}
