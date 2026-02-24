/* eslint-disable */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { supabase, insertVideoUpload, getUserVideoUploads, deleteVideoUpload } from '../supabase';
import './VideoUploadView.css';

const BUCKET = 'vimax-videos';
const MAX_BYTES = 500 * 1024 * 1024;
const ALLOWED_MIME = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];
const ALLOWED_EXT = ['mp4', 'mov', 'avi', 'webm', 'mkv'];

const CONTENT_TYPES = [
  { value: 'educational', label: 'Educational', desc: 'Courses & tutorials' },
  { value: 'marketing', label: 'Marketing', desc: 'Ads & promos' },
  { value: 'social_media', label: 'Social Media', desc: 'Reels & shorts' },
  { value: 'entertainment', label: 'Entertainment', desc: 'Films & series' },
  { value: 'documentary', label: 'Documentary', desc: 'Non-fiction' },
  { value: 'tutorial', label: 'Tutorial', desc: 'How-to guides' },
  { value: 'general', label: 'General', desc: 'Uncategorized' },
];

function formatBytes(n) {
  if (n >= 1073741824) return (n / 1073741824).toFixed(1) + ' GB';
  if (n >= 1048576) return (n / 1048576).toFixed(1) + ' MB';
  if (n >= 1024) return (n / 1024).toFixed(0) + ' KB';
  return n + ' B';
}

function formatDuration(s) {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatDimensions(w, h) {
  if (!w || !h) return null;
  return `${w}×${h}`;
}

function getExt(name) {
  return name.split('.').pop().toLowerCase();
}

function validateFile(file) {
  const ext = getExt(file.name);
  if (!ALLOWED_EXT.includes(ext)) {
    return `Unsupported format ".${ext}". Allowed: ${ALLOWED_EXT.join(', ')}`;
  }
  if (file.size > MAX_BYTES) {
    return `File too large (${formatBytes(file.size)}). Maximum is 500 MB.`;
  }
  return null;
}

function extractMetadata(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadedmetadata = () => {
      const duration = video.duration || null;
      const width = video.videoWidth || null;
      const height = video.videoHeight || null;

      video.currentTime = Math.min(1, duration ? duration * 0.1 : 0);

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 320;
          canvas.height = Math.round(320 / (width / height)) || 180;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          cleanup();
          resolve({ duration, width, height, thumbnail });
        } catch {
          cleanup();
          resolve({ duration, width, height, thumbnail: null });
        }
      };

      video.onerror = () => { cleanup(); resolve({ duration, width, height, thumbnail: null }); };
    };

    video.onerror = () => { cleanup(); resolve({ duration: null, width: null, height: null, thumbnail: null }); };
    video.src = url;
  });
}

async function ensureBucket(supabaseUrl, anonKey) {
  try {
    await fetch(`${supabaseUrl}/functions/v1/video-upload?action=init`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${anonKey}`, Apikey: anonKey },
    });
  } catch {}
}

export default function VideoUploadView({ userId }) {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  const [file, setFile] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const [contentType, setContentType] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploads, setUploads] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (userId) loadUploads();
  }, [userId]);

  const loadUploads = async () => {
    setLoadingList(true);
    try {
      const data = await getUserVideoUploads(userId);
      setUploads(data);
    } catch {
      setUploads([]);
    } finally {
      setLoadingList(false);
    }
  };

  const pickFile = useCallback(async (f) => {
    setFileError('');
    setUploadError('');
    const err = validateFile(f);
    if (err) { setFileError(err); return; }
    setFile(f);
    const meta = await extractMetadata(f);
    setFileMeta(meta);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }, [pickFile]);

  const handleInputChange = (e) => {
    const f = e.target.files[0];
    if (f) pickFile(f);
    e.target.value = '';
  };

  const handleRemove = () => {
    setFile(null);
    setFileMeta(null);
    setFileError('');
    setUploadError('');
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setUploadError('');
    setUploadProgress(0);

    try {
      await ensureBucket(supabaseUrl, anonKey);

      const ext = getExt(file.name);
      const storagePath = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      setUploadProgress(10);

      const { error: storageErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          contentType: file.type || `video/${ext}`,
          upsert: false,
        });

      if (storageErr) throw new Error(storageErr.message);

      setUploadProgress(80);

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      const storageUrl = urlData?.publicUrl || '';

      const record = await insertVideoUpload({
        user_id: userId,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type || `video/${ext}`,
        format: ext,
        duration_seconds: fileMeta?.duration ?? null,
        width: fileMeta?.width ?? null,
        height: fileMeta?.height ?? null,
        thumbnail_data: fileMeta?.thumbnail || '',
        storage_path: storagePath,
        storage_url: storageUrl,
        content_type: contentType,
        metadata: {},
      });

      setUploadProgress(100);
      setUploads(prev => [record, ...prev]);

      setTimeout(() => {
        handleRemove();
        setUploading(false);
      }, 800);
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (upload) => {
    try {
      if (upload.storage_path) {
        await supabase.storage.from(BUCKET).remove([upload.storage_path]);
      }
      await deleteVideoUpload(upload.id);
      setUploads(prev => prev.filter(u => u.id !== upload.id));
    } catch {}
  };

  const handleDownload = async (upload) => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(upload.storage_path, 3600);
      if (!error && data?.signedUrl) {
        const a = document.createElement('a');
        a.href = data.signedUrl;
        a.download = upload.original_filename;
        a.click();
      }
    } catch {}
  };

  const validationChecks = file ? [
    { label: 'Format', pass: ALLOWED_EXT.includes(getExt(file.name)), failMsg: 'Unsupported' },
    { label: 'Size', pass: file.size <= MAX_BYTES, failMsg: 'Too large' },
    { label: 'Readable', pass: !!fileMeta, failMsg: 'Cannot read' },
  ] : [];

  return (
    <div className="vup-root">
      <div className="vup-header">
        <h2 className="vup-title">Video Uploads</h2>
        <p className="vup-subtitle">
          Upload MP4, MOV, AVI, WebM, or MKV files up to 500 MB. Thumbnails and metadata are extracted automatically.
        </p>
      </div>

      {!file ? (
        <div
          className={`vup-dropzone${dragOver ? ' drag-over' : ''}${fileError ? ' has-error' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          tabIndex={0}
          role="button"
          aria-label="Drop video file here or click to browse"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_MIME.join(',') + ',.mp4,.mov,.avi,.webm,.mkv'}
            onChange={handleInputChange}
          />
          <div className="vup-drop-icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M4 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M13 4v12M8 9l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="vup-drop-title">Drop your video here, or click to browse</p>
          <p className="vup-drop-sub">Supports MP4, MOV, AVI, WebM, MKV &mdash; up to 500 MB</p>
          <div className="vup-drop-formats">
            {ALLOWED_EXT.map(f => (
              <span key={f} className="vup-format-badge">{f.toUpperCase()}</span>
            ))}
          </div>
          {fileError && <p className="vup-drop-error">{fileError}</p>}
        </div>
      ) : (
        <div className="vup-preview-card">
          <div className="vup-preview-top">
            <div className="vup-thumbnail">
              {fileMeta?.thumbnail ? (
                <img src={fileMeta.thumbnail} alt="thumbnail" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 8.5l7 3.5-7 3.5V8.5Z" fill="currentColor" />
                </svg>
              )}
            </div>
            <div className="vup-file-info">
              <div className="vup-file-name">{file.name}</div>
              <div className="vup-file-meta">
                <span>{formatBytes(file.size)}</span>
                {fileMeta?.duration && <span>{formatDuration(fileMeta.duration)}</span>}
                {fileMeta?.width && fileMeta?.height && <span>{formatDimensions(fileMeta.width, fileMeta.height)}</span>}
                <span>{getExt(file.name).toUpperCase()}</span>
              </div>
              <div className="vup-checklist">
                {validationChecks.map(c => (
                  <span key={c.label} className={`vup-check-item ${c.pass ? 'pass' : 'fail'}`}>
                    {c.pass ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" fill="#16a34a" />
                        <path d="M3.5 6l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" fill="#dc2626" />
                        <path d="M4 4l4 4M8 4l-4 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    )}
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
            <button className="vup-remove-btn" onClick={handleRemove} disabled={uploading}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="vup-content-type">
            <div className="vup-field-label">Content Type</div>
            <div className="vup-type-grid">
              {CONTENT_TYPES.map(ct => (
                <button
                  key={ct.value}
                  className={`vup-type-btn ${contentType === ct.value ? 'selected' : ''}`}
                  onClick={() => setContentType(ct.value)}
                  disabled={uploading}
                >
                  <span className="type-label">{ct.label}</span>
                  <span className="type-desc">{ct.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {uploading && (
            <div className="vup-progress-section">
              <div className="vup-progress-label">
                <span>{uploadProgress < 100 ? 'Uploading...' : 'Processing...'}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="vup-progress-bar">
                <div
                  className={`vup-progress-fill${uploadProgress === 100 ? ' complete' : ''}`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="vup-action-row">
            <button
              className="vup-upload-btn"
              onClick={handleUpload}
              disabled={uploading || validationChecks.some(c => !c.pass)}
            >
              {uploading ? <span className="spinner" /> : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 10v2h10v-2M7 2v7M4 5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
            {!uploading && (
              <button className="vup-cancel-btn" onClick={handleRemove}>Cancel</button>
            )}
            {uploadError && <span className="vup-upload-error">{uploadError}</span>}
          </div>
        </div>
      )}

      <div className="vup-list-section">
        <div className="vup-list-header">
          <span className="vup-list-title">Uploaded Videos</span>
          <span className="vup-list-count">{uploads.length} file{uploads.length !== 1 ? 's' : ''}</span>
        </div>

        {loadingList ? (
          <div className="vup-list-empty">
            <p>Loading uploads...</p>
          </div>
        ) : uploads.length === 0 ? (
          <div className="vup-list-empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="6" y="8" width="36" height="32" rx="5" stroke="currentColor" strokeWidth="2" />
              <path d="M18 18l13 6-13 6V18Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <p>No videos uploaded yet. Drop a file above to get started.</p>
          </div>
        ) : (
          uploads.map(upload => (
            <div key={upload.id} className="vup-upload-item">
              <div className="vup-item-thumb">
                {upload.thumbnail_data ? (
                  <img src={upload.thumbnail_data} alt="thumb" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="3" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 7.5l5 2.5-5 2.5V7.5Z" fill="currentColor" />
                  </svg>
                )}
              </div>
              <div className="vup-item-info">
                <div className="vup-item-name">{upload.original_filename}</div>
                <div className="vup-item-details">
                  <span>{formatBytes(upload.file_size)}</span>
                  {upload.duration_seconds && <span>{formatDuration(upload.duration_seconds)}</span>}
                  {upload.width && upload.height && <span>{formatDimensions(upload.width, upload.height)}</span>}
                  {upload.format && <span>{upload.format.toUpperCase()}</span>}
                  <span>{new Date(upload.created_at).toLocaleDateString()}</span>
                </div>
                <div className="vup-item-details" style={{ marginTop: 4 }}>
                  <span className={`vup-item-badge status-${upload.status}`}>{upload.status}</span>
                  <span className="vup-item-badge type-badge">
                    {CONTENT_TYPES.find(c => c.value === upload.content_type)?.label || upload.content_type}
                  </span>
                </div>
              </div>
              <div className="vup-item-actions">
                {upload.storage_path && (
                  <button
                    className="vup-item-action-btn"
                    title="Download"
                    onClick={() => handleDownload(upload)}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 10v2h10v-2M7 2v7M4 9l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <button
                  className="vup-item-action-btn danger"
                  title="Delete"
                  onClick={() => handleDelete(upload)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 4h10M5 4V2.5h4V4M5.5 6v4M8.5 6v4M3 4l.7 7.5h6.6L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
