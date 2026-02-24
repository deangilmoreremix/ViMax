/* eslint-disable */
import React, { useRef } from 'react';
import './ContentStep.css';

const PIPELINE_INFO = {
  idea2video: {
    label: 'Idea2Video',
    tagline: 'From Spark to Screen',
    badge: 'Algorithm',
    accentColor: '#2563eb',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    description: 'Describe your idea — AI writes the full script, creates characters, and generates your video. Skip the technical complexity.',
    callout: 'One-Prompt to Finished Video',
    inputLabel: 'Your Video Idea',
    placeholder: 'Describe your video concept in detail. The more specific you are, the better the result.\n\nExample: "A product launch video for a premium noise-canceling headphone brand — sleek design, urban professional setting, dramatic lighting, showing someone blocking out city noise to focus."',
    maxLength: 2000,
  },
  script2video: {
    label: 'Script2Video',
    tagline: 'Unlimited Screenplay Video Creation',
    badge: 'Backend',
    accentColor: '#dc2626',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 3h10a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    description: 'Upload or paste a screenplay-format script. Use scene headings (EXT./INT.), action lines, and dialogue. Complete control over every aspect.',
    callout: 'Complete Creative Freedom',
    inputLabel: 'Your Screenplay',
    placeholder: 'EXT. COFFEE SHOP - MORNING\n\nSARAH, 28, sits alone at a corner table, laptop open. The morning rush fills the café with noise.\n\nSARAH\n(typing intently)\nThis has to work...\n\nINT. COFFEE SHOP - CONTINUOUS\n\nThe BARISTA slides a coffee toward her.',
    maxLength: 10000,
  },
  novel2video: {
    label: 'Novel2Video',
    tagline: 'Smart Literary Adaptation Engine',
    badge: 'Frontend',
    accentColor: '#0d9488',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 3h8l4 4v10H4V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 3v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    description: 'Paste or upload a complete novel. AI intelligently compresses the narrative, tracks characters, and adapts each scene into video.',
    callout: 'From Any Narrative to Reality',
    inputLabel: 'Your Novel / Story',
    placeholder: 'Paste your novel text here, or upload a .txt, .md, or .pdf file below...',
    maxLength: 50000,
  },
  cameo: {
    label: 'AutoCameo',
    tagline: 'Generate Video from Your Photo',
    badge: 'Backend',
    accentColor: '#7c3aed',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    description: 'Upload a photo and describe the scene. AI transforms you or your pet into a guest star across cinematic sequences and interactive storylines.',
    callout: 'Make Your Own Cameo Video',
    inputLabel: 'Scene Description',
    placeholder: 'Describe the scene where the photo subject should appear...\n\nExample: "A professional walking through a modern city, presenting a product to a business meeting."',
    maxLength: 2000,
  },
};

const PIPELINE_OPTIONS = [
  { value: 'idea2video', label: 'Idea2Video', desc: 'Start from a concept' },
  { value: 'script2video', label: 'Script2Video', desc: 'Use a screenplay' },
  { value: 'novel2video', label: 'Novel2Video', desc: 'Adapt written work' },
  { value: 'cameo', label: 'AutoCameo', desc: 'Star in a video' },
];

export default function ContentStep({ formData, onUpdate, onEnhance }) {
  const { pipeline, idea, script, requirement } = formData;
  const fileInputRef = useRef(null);
  const photoFileRef = useRef(null);
  const info = PIPELINE_INFO[pipeline] || PIPELINE_INFO.idea2video;
  const mainText = pipeline === 'idea2video' || pipeline === 'cameo' ? idea : script;
  const setMainText = (val) => {
    if (pipeline === 'idea2video' || pipeline === 'cameo') {
      onUpdate({ idea: val });
    } else {
      onUpdate({ script: val });
    }
  };

  return (
    <div className="content-step animate-fade-in-up">
      <div className="content-step-header">
        <h2 className="content-step-title">What's your content?</h2>
        <p className="content-step-desc">Choose your pipeline and provide your content below.</p>
      </div>

      <div className="pipeline-selector">
        {PIPELINE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`pipeline-option ${pipeline === opt.value ? 'active' : ''}`}
            onClick={() => onUpdate({ pipeline: opt.value })}
          >
            <div className="pipeline-option-icon">
              {PIPELINE_INFO[opt.value].icon}
            </div>
            <div className="pipeline-option-text">
              <span className="pipeline-option-label">{opt.label}</span>
              <span className="pipeline-option-desc">{opt.desc}</span>
            </div>
            {pipeline === opt.value && (
              <svg className="pipeline-option-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#2563eb" />
                <path d="M4.5 8L6.5 10L11.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <div className="content-info-banner" style={{ '--info-accent': info.accentColor }}>
        <div className="content-info-icon">{info.icon}</div>
        <div className="content-info-body">
          <div className="content-info-top">
            <span className="content-info-tagline">{info.tagline}</span>
            <span className="content-info-badge">{info.badge}</span>
          </div>
          <p>{info.description}</p>
          {info.callout && (
            <span className="content-info-callout">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1l1.24 3.63H11L8.38 6.77l.95 3.73L6 8.4 2.67 10.5l.95-3.73L1 4.63h3.76L6 1Z" fill="currentColor" />
              </svg>
              {info.callout}
            </span>
          )}
        </div>
      </div>

      <div className="content-form-group">
        <div className="content-label-row">
          <label className="content-label">{info.inputLabel}</label>
          <span className="content-char-count">
            {mainText.length} / {info.maxLength.toLocaleString()}
          </span>
        </div>
        <textarea
          className="content-textarea"
          value={mainText}
          onChange={(e) => setMainText(e.target.value)}
          placeholder={info.placeholder}
          maxLength={info.maxLength}
          rows={pipeline === 'script2video' || pipeline === 'novel2video' ? 10 : 6}
        />
        {(pipeline === 'idea2video' || pipeline === 'cameo') && (
          <button className="enhance-btn" onClick={() => onEnhance && onEnhance(mainText)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3.05 3.05l1.41 1.41M9.54 9.54l1.41 1.41M3.05 10.95l1.41-1.41M9.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Enhance with AI
          </button>
        )}
      </div>

      {(pipeline === 'script2video' || pipeline === 'novel2video') && (
        <div className="content-file-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf"
            className="content-file-input-hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) onUpdate({ scriptFile: file });
            }}
          />
          <button
            className="content-file-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 11v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {formData.scriptFile ? formData.scriptFile.name : 'Upload file instead (.txt, .md, .pdf)'}
          </button>
          {formData.scriptFile && (
            <button
              className="content-file-remove"
              onClick={() => onUpdate({ scriptFile: null })}
            >Remove</button>
          )}
        </div>
      )}

      {pipeline === 'cameo' && (
        <div className="content-file-upload">
          <input
            ref={photoFileRef}
            type="file"
            accept="image/*"
            className="content-file-input-hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) onUpdate({ photoFile: file });
            }}
          />
          <div
            className={`content-photo-upload ${formData.photoFile ? 'has-file' : ''}`}
            onClick={() => photoFileRef.current?.click()}
          >
            {formData.photoFile ? (
              <div className="content-photo-preview">
                <img src={URL.createObjectURL(formData.photoFile)} alt="Preview" />
                <div className="content-photo-preview-info">
                  <span>{formData.photoFile.name}</span>
                  <button
                    className="content-file-remove"
                    onClick={(e) => { e.stopPropagation(); onUpdate({ photoFile: null }); }}
                  >Remove</button>
                </div>
              </div>
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="24" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>Upload your photo</span>
                <span className="content-photo-hint">JPG, PNG, WebP up to 10MB</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="content-form-group">
        <label className="content-label">Additional Requirements <span className="content-optional">(optional)</span></label>
        <input
          type="text"
          className="content-input"
          value={requirement}
          onChange={(e) => onUpdate({ requirement: e.target.value })}
          placeholder="e.g., Keep it under 2 minutes, target audience is teenagers, no violence"
          maxLength={300}
        />
      </div>
    </div>
  );
}
