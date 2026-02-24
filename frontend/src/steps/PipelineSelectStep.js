/* eslint-disable */
import React, { useState } from 'react';
import './PipelineSelectStep.css';

const PIPELINES = [
  {
    value: 'idea2video',
    emoji: '🌟',
    name: 'Idea2Video',
    badge: 'Algorithm',
    tagline: 'From Spark to Screen',
    description: 'Transform raw ideas into complete video stories through intelligent multi-agent workflows automating storytelling, character design, and production.',
    cta: 'Start with an idea',
    accentColor: '#2563eb',
    accentBg: 'rgba(37, 99, 235, 0.06)',
    accentBorder: 'rgba(37, 99, 235, 0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 14h8M14 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="5" r="1.5" fill="currentColor" />
        <circle cx="23" cy="14" r="1.5" fill="currentColor" />
        <circle cx="14" cy="23" r="1.5" fill="currentColor" />
        <circle cx="5" cy="14" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: 'novel2video',
    emoji: '🎨',
    name: 'Novel2Video',
    badge: 'Frontend',
    tagline: 'Smart Literary Adaptation Engine',
    description: 'Transform complete novels into episodic video content with intelligent narrative compression, character tracking, and scene-by-scene visual adaptation.',
    cta: 'Adapt a novel',
    accentColor: '#0d9488',
    accentBg: 'rgba(13, 148, 136, 0.06)',
    accentBorder: 'rgba(13, 148, 136, 0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 4h12l6 6v14H6V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M18 4v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 14h8M10 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 'script2video',
    emoji: '⚙️',
    name: 'Script2Video',
    badge: 'Backend',
    tagline: 'Unlimited Screenplay Video Creation',
    description: 'Unleash your creativity by writing any screenplay from personal stories to epic adventures, giving you complete control over every aspect of your visual storytelling.',
    cta: 'Use a screenplay',
    accentColor: '#dc2626',
    accentBg: 'rgba(220, 38, 38, 0.06)',
    accentBorder: 'rgba(220, 38, 38, 0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 10h10M9 14h10M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 'cameo',
    emoji: '🤳',
    name: 'AutoCameo',
    badge: 'Backend',
    tagline: 'Generate Video from Your Photo',
    description: 'Create your own cameo video, transforming yourself or your pet into a guest star who appears across limitless creative scripts, cinematic sequences, and interactive storylines.',
    cta: 'Star in a video',
    accentColor: '#9333ea',
    accentBg: 'rgba(147, 51, 234, 0.06)',
    accentBorder: 'rgba(147, 51, 234, 0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="6" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="22" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const FEATURE_HIGHLIGHTS = [
  { icon: '🧠', label: 'Effortless Production', desc: 'One-prompt to finished video' },
  { icon: '🚀', label: 'Complete Creative Freedom', desc: 'From any narrative to reality' },
  { icon: '🔊', label: 'Audio & Video Binding', desc: 'Synchronized storytelling' },
  { icon: '🎨', label: 'Professional Quality', desc: 'Movie-grade output' },
  { icon: '🤩', label: 'Interactive Video', desc: 'Make your own cameo video' },
];

export default function PipelineSelectStep({ onSelect, onUseAI }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="pipeline-select-step animate-fade-in-up">
      <div className="pipeline-select-hero">
        <div className="pipeline-select-logo">
          <span className="pipeline-select-logo-vi">Vi</span>
          <span className="pipeline-select-logo-max">Max</span>
        </div>
        <h1 className="pipeline-select-title">What do you want to create today?</h1>
        <p className="pipeline-select-subtitle">
          Choose your creation mode or let AI guide you to the perfect pipeline.
        </p>
      </div>

      <div className="pipeline-select-grid">
        {PIPELINES.map((p) => (
          <button
            key={p.value}
            className={`pipeline-select-card ${hovered === p.value ? 'hovered' : ''}`}
            style={{
              '--card-accent': p.accentColor,
              '--card-accent-bg': p.accentBg,
              '--card-accent-border': p.accentBorder,
            }}
            onClick={() => onSelect(p.value)}
            onMouseEnter={() => setHovered(p.value)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="pipeline-select-card-top">
              <div className="pipeline-select-card-icon">{p.icon}</div>
              <span className="pipeline-select-card-badge">{p.badge}</span>
            </div>
            <div className="pipeline-select-card-emoji">{p.emoji}</div>
            <h3 className="pipeline-select-card-name">{p.name}</h3>
            <p className="pipeline-select-card-tagline">{p.tagline}</p>
            <p className="pipeline-select-card-desc">{p.description}</p>
            <div className="pipeline-select-card-cta">
              {p.cta}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="pipeline-select-ai-row">
        <button className="pipeline-select-ai-btn" onClick={onUseAI}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect width="18" height="18" rx="9" fill="#2563eb" />
            <path d="M5 8h8M5 11h5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Not sure? Let AI guide me to the right pipeline
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="pipeline-select-features">
        {FEATURE_HIGHLIGHTS.map((f) => (
          <div key={f.label} className="pipeline-select-feature">
            <span className="pipeline-select-feature-icon">{f.icon}</span>
            <div>
              <p className="pipeline-select-feature-label">{f.label}</p>
              <p className="pipeline-select-feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
