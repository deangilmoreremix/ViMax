/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from './ThemeContext';
import { useToast } from './ToastContext';
import ThemeToggle from './ThemeToggle';
import PipelineVisualizer from './PipelineVisualizer';
import ModernFileUpload from './ModernFileUpload';
import LoadingScreen from './LoadingScreen';
import './App.css';

// Reusable FileUpload component with drag-and-drop
const FileUpload = ({ label, accept, file, setFile, error, setError, fileType, disabled = false }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const droppedFile = files[0];
      const validationError = validateFile(droppedFile, fileType);
      setFile(droppedFile);
      setError(validationError);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile, fileType);
      setFile(selectedFile);
      setError(validationError);
    }
  };

  // Batch management functions
  const addBatchJob = () => {
    const newJob = {
      pipeline_type: pipelineType,
      idea: idea,
      script: script,
      user_requirement: requirement,
      style: style,
      image_generator: imageGenerator,
      video_generator: videoGenerator,
      quality: quality,
      resolution: resolution,
      format: format
    };
    setBatchJobs([...batchJobs, newJob]);

    // Clear current form
    setIdea('');
    setScript('');
  };

  const removeBatchJob = (index) => {
    setBatchJobs(batchJobs.filter((_, i) => i !== index));
  };

  const createBatch = async () => {
    if (batchJobs.length === 0) {
      alert('Please add at least one job to the batch');
      return;
    }

    if (!batchName.trim()) {
      setBatchName(`Batch ${new Date().toLocaleString()}`);
    }

    try {
      const apiBase = getApiBaseUrl();
      const headers = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      const response = await axios.post(`${apiBase}/batch`, {
        user_id: userId,
        name: batchName,
        jobs: batchJobs
      }, { headers });

      alert(`Batch created successfully! Batch ID: ${response.data.batch_id}`);
      setBatchJobs([]);
      setBatchName('');
      setShowBatch(false);

      // Reload user batches
      loadUserData(userId);
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Error creating batch. Please try again.');
    }
  };

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsSwipeGesture(false);
  };

  const handleTouchMove = (e) => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;

    // Detect horizontal swipe (more significant than vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      setIsSwipeGesture(true);
      e.preventDefault(); // Prevent scrolling during horizontal swipe
    }
  };

  const handleTouchEnd = (e) => {
    if (!isSwipeGesture) return;

    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;

    // Swipe left to show history, swipe right to show batch
    if (deltaX > 100) {
      // Swipe left - show history
      setShowHistory(true);
      setShowBatch(false);
    } else if (deltaX < -100) {
      // Swipe right - show batch
      setShowBatch(true);
      setShowHistory(false);
    }

    setTouchStartX(0);
    setTouchStartY(0);
    setIsSwipeGesture(false);
  };

  // Mobile navigation handlers
  const handleMobileNav = (section) => {
    if (section === 'history') {
      setShowHistory(!showHistory);
      setShowBatch(false);
    } else if (section === 'batch') {
      setShowBatch(!showBatch);
      setShowHistory(false);
    }
  };

  // Detect if device is mobile
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // Video editing functions
  const openVideoEditor = (videoUrl) => {
    setEditingVideo(videoUrl);
    setShowVideoEditor(true);
    setVideoTrimStart(0);
    setVideoTrimEnd(100);
    setTextOverlays([]);
    setSelectedEffect('none');
  };

  const closeVideoEditor = () => {
    setShowVideoEditor(false);
    setEditingVideo(null);
  };

  const addTextOverlay = () => {
    const newOverlay = {
      id: Date.now(),
      text: 'Your Text Here',
      x: 50, // percentage
      y: 50, // percentage
      fontSize: 24,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
      startTime: 0,
      endTime: 10
    };
    setTextOverlays([...textOverlays, newOverlay]);
  };

  const updateTextOverlay = (id, updates) => {
    setTextOverlays(textOverlays.map(overlay =>
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };

  const removeTextOverlay = (id) => {
    setTextOverlays(textOverlays.filter(overlay => overlay.id !== id));
  };

  const applyVideoEdits = async () => {
    // For now, just show a preview. In a full implementation,
    // this would use FFmpeg.wasm or similar for actual editing
    alert('Video editing applied! (Preview mode - full implementation would process the video)');

    // Reset editing state
    closeVideoEditor();
  };

  // Haptic feedback for touch interactions
  const triggerHapticFeedback = (type = 'light') => {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(50);
          break;
        case 'medium':
          navigator.vibrate(100);
          break;
        case 'heavy':
          navigator.vibrate(200);
          break;
        default:
          navigator.vibrate(50);
      }
    }
  };

  // Enhanced touch handlers with haptic feedback
  const handleTouchStartEnhanced = (e) => {
    handleTouchStart(e);
    triggerHapticFeedback('light');
  };

  const handleButtonTouch = (action) => {
    triggerHapticFeedback('medium');
    action();
  };

  // Progressive Web App support
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => console.log('SW registered'))
          .catch(error => console.log('SW registration failed'));
      });
    }

    // Handle PWA install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });

    // Add viewport meta tag for mobile
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
  }, []);

  const validateFile = (file, type) => {
    const maxSizes = {
      script: 5 * 1024 * 1024, // 5MB
      photo: 10 * 1024 * 1024,  // 10MB
      novel: 20 * 1024 * 1024   // 20MB for novels
    };

    const allowedTypes = {
      script: ['text/plain', 'text/markdown', '.txt', '.md'],
      photo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      novel: ['text/plain', 'text/markdown', '.txt', '.md', '.pdf']
    };

    if (!file) return null;

    if (file.size > maxSizes[type]) {
      return `File size must be less than ${maxSizes[type] / (1024 * 1024)}MB`;
    }

    const isValidType = allowedTypes[type].some(allowedType =>
      file.type === allowedType || file.name.toLowerCase().endsWith(allowedType)
    );

    if (!isValidType) {
      return `Invalid file type. Allowed: ${allowedTypes[type].join(', ')}`;
    }

    return null;
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div
        className={`file-upload-zone ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={(e) => handleDrop(e)}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled}
          className="file-input"
          id={`file-${fileType}`}
        />
        <label htmlFor={`file-${fileType}`} className="file-upload-label">
          {file ? (
            <div className="file-preview">
              {fileType === 'photo' && file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="image-preview"
                />
              ) : (
                <div className="file-icon">
                  📄
                </div>
              )}
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                {disabled ? 'Coming Soon' : 'Drop file here or click to browse'}
              </div>
              <div className="upload-hint">
                {fileType === 'script' && 'Supports .txt, .md files up to 5MB'}
                {fileType === 'photo' && 'Supports images up to 10MB'}
                {fileType === 'novel' && 'Supports .txt, .md, .pdf files up to 20MB'}
              </div>
            </div>
          )}
        </label>
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

function App() {
  const { theme } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  const [pipelineType, setPipelineType] = useState('idea2video');
  const [idea, setIdea] = useState('');
  const [script, setScript] = useState('');
  const [requirement, setRequirement] = useState('');
  const [style, setStyle] = useState('Realistic');
  const [quality, setQuality] = useState('standard');
  const [resolution, setResolution] = useState('1080p');
  const [format, setFormat] = useState('mp4');
  const [imageGenerator, setImageGenerator] = useState('google');
  const [videoGenerator, setVideoGenerator] = useState('google');
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [scriptFile, setScriptFile] = useState(null);
  const [novelFile, setNovelFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [fileErrors, setFileErrors] = useState({});
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // User management
  const [userId, setUserId] = useState('');
  const [userHistory, setUserHistory] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [batchJobs, setBatchJobs] = useState([]);
  const [batchName, setBatchName] = useState('');
  const [userBatches, setUserBatches] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('vimax_api_key') || '');
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSwipeGesture, setIsSwipeGesture] = useState(false);

  // Video editing state
  const [editingVideo, setEditingVideo] = useState(null);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [videoTrimStart, setVideoTrimStart] = useState(0);
  const [videoTrimEnd, setVideoTrimEnd] = useState(100);
  const [textOverlays, setTextOverlays] = useState([]);
  const [selectedEffect, setSelectedEffect] = useState('none');


  // Initialize user session
  useEffect(() => {
    const storedUserId = localStorage.getItem('vimax_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
      loadUserData(storedUserId);
    } else {
      const newUserId = generateUserId();
      setUserId(newUserId);
      localStorage.setItem('vimax_user_id', newUserId);
      loadUserData(newUserId);
    }
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('vimax_api_key', apiKey);
    } else {
      localStorage.removeItem('vimax_api_key');
    }
  }, [apiKey]);

  // Generate unique user ID
  const generateUserId = () => {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  // Get API base URL from environment or default
  const getApiBaseUrl = () => {
    return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  };

  // Load user data
  const loadUserData = async (uid) => {
    try {
      const apiBase = getApiBaseUrl();
      const [userResponse, batchResponse] = await Promise.all([
        axios.get(`${apiBase}/user/${uid}`),
        axios.get(`${apiBase}/user/${uid}/batches`)
      ]);

      setUserHistory(userResponse.data.history || []);
      setUserStats(userResponse.data.stats || {});
      setUserBatches(batchResponse.data.batches || []);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Initialize empty data for new users
      setUserHistory([]);
      setUserStats({ total_generations: 0, total_videos: 0, average_rating: 0 });
      setUserBatches([]);
    }
  };

  // Enhanced WebSocket connection with reconnection
  useEffect(() => {
    if (jobId) {
      let ws = null;
      let reconnectTimeout = null;
      let heartbeatInterval = null;
      const maxReconnectAttempts = 5;
      let currentReconnectAttempts = 0;

      const connectWebSocket = () => {
        if (currentReconnectAttempts >= maxReconnectAttempts) {
          setWsStatus('failed');
          console.error('Max reconnection attempts reached');
          return;
        }

        setWsStatus('connecting');
        ws = new WebSocket(`ws://localhost:8000/ws/job/${jobId}`);

        ws.onopen = () => {
          setWsStatus('connected');
          setReconnectAttempts(0);
          currentReconnectAttempts = 0;
          console.log('WebSocket connected');

          // Start heartbeat
          heartbeatInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 25000); // Ping every 25 seconds
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'ping') {
              // Respond to server ping
              ws.send(JSON.stringify({ type: 'pong' }));
            } else if (data.type === 'pong') {
              // Server responded to our ping - connection is healthy
            } else {
              // Regular status update
              setJobStatus(data);
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };

        ws.onclose = (event) => {
          setWsStatus('disconnected');
          clearInterval(heartbeatInterval);

          if (!event.wasClean && currentReconnectAttempts < maxReconnectAttempts) {
            currentReconnectAttempts++;
            setReconnectAttempts(currentReconnectAttempts);
            console.log(`WebSocket closed, attempting reconnection ${currentReconnectAttempts}/${maxReconnectAttempts}`);

            // Exponential backoff for reconnection
            const delay = Math.min(1000 * Math.pow(2, currentReconnectAttempts - 1), 30000);
            reconnectTimeout = setTimeout(connectWebSocket, delay);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsStatus('error');
        };
      };

      connectWebSocket();

      return () => {
        if (ws) {
          ws.close();
        }
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
      };
    }
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for file validation errors
    if (fileErrors.script || fileErrors.photo) {
      showError('Please fix file validation errors before submitting.');
      return;
    }

    setIsLoading(true);
    showInfo('Starting video generation...', 3000);

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('pipeline_type', pipelineType);
    formData.append('idea', idea);
    formData.append('script', script);
    formData.append('user_requirement', requirement);
    formData.append('style', style);
    formData.append('image_generator', imageGenerator);
    formData.append('video_generator', videoGenerator);
    formData.append('quality', quality);
    formData.append('resolution', resolution);
    formData.append('format', format);

    if (scriptFile) {
      formData.append('script_file', scriptFile);
    }

    if (novelFile) {
      formData.append('novel_file', novelFile);
    }

    if (photoFile) {
      formData.append('photo_file', photoFile);
    }

    try {
      const apiBase = getApiBaseUrl();
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      const response = await axios.post(`${apiBase}/generate-video`, formData, {
        headers,
      });

      setJobId(response.data.job_id);
      setJobStatus({ status: 'processing', message: 'Video generation started...' });
      showSuccess('Video generation started! Check progress below.');
    } catch (error) {
      console.error('Error starting video generation:', error);
      showError('Failed to start video generation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (jobId) {
      window.open(`http://localhost:8000/job/${jobId}/download`, '_blank');
    }
  };

  // Video Editor Functions
  const openVideoEditor = (videoUrl) => {
    setEditingVideo(videoUrl);
    setShowVideoEditor(true);
    setVideoTrimStart(0);
    setVideoTrimEnd(100);
    setTextOverlays([]);
    setSelectedEffect('none');
  };

  const closeVideoEditor = () => {
    setShowVideoEditor(false);
    setEditingVideo('');
  };

  const addTextOverlay = () => {
    const newOverlay = {
      id: Date.now(),
      text: 'Your Text Here',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#ffffff',
      strokeWidth: 2,
      strokeColor: '#000000'
    };
    setTextOverlays([...textOverlays, newOverlay]);
  };

  const updateTextOverlay = (id, updates) => {
    setTextOverlays(textOverlays.map(overlay =>
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };

  const removeTextOverlay = (id) => {
    setTextOverlays(textOverlays.filter(overlay => overlay.id !== id));
  };

  const applyVideoEdits = () => {
    // For now, just close the editor and show a success message
    // In a real implementation, this would send the edits to the backend
    alert('Video edits applied successfully! (This is a placeholder - backend integration needed)');
    closeVideoEditor();
  };

  // Touch event handlers for mobile responsiveness
  const handleTouchStartEnhanced = (e) => {
    // Enhanced touch start handler for mobile gestures
    console.log('Touch start:', e.touches);
  };

  const handleTouchMove = (e) => {
    // Handle touch move for swipe gestures
    console.log('Touch move:', e.touches);
  };

  const handleTouchEnd = (e) => {
    // Handle touch end for gesture completion
    console.log('Touch end');
  };

  const handleButtonTouch = (callback) => (e) => {
    // Enhanced button touch with haptic feedback
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50); // Haptic feedback
    }
    callback();
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const triggerHapticFeedback = (type = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 50,
        medium: 100,
        heavy: 200
      };
      navigator.vibrate(patterns[type] || 50);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className="App"
      onTouchStart={handleTouchStartEnhanced}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <header className="App-header">
        <div className="header-content">
          <div className="title-section">
            <h1>🎬 ViMax Video Generator</h1>
            <p>Transform your ideas into videos with AI</p>
          </div>

          <ThemeToggle />

          <div className="user-section">
            <div className="user-stats">
              <span className="stat-item">📊 {userStats.total_generations || 0} generations</span>
              <span className="stat-item">⭐ {userStats.average_rating ? userStats.average_rating.toFixed(1) : '0.0'} avg rating</span>
            </div>
            <button
              onClick={() => handleButtonTouch(() => setShowHistory(!showHistory))}
              className="history-btn touch-target"
            >
              📚 History ({userHistory.length})
            </button>
            <button
              onClick={() => handleButtonTouch(() => setShowBatch(!showBatch))}
              className="batch-btn touch-target"
            >
              📦 Batch ({userBatches.length})
            </button>
          </div>
        </div>

        <div className="connection-status">
          <span className={`status-indicator ${wsStatus}`}>
            {wsStatus === 'connected' && '🟢'}
            {wsStatus === 'connecting' && '🟡'}
            {wsStatus === 'disconnected' && '🔴'}
            {wsStatus === 'error' && '❌'}
            {wsStatus === 'failed' && '💀'}
          </span>
          <span className="status-text">
            {wsStatus === 'connected' && 'Connected'}
            {wsStatus === 'connecting' && 'Connecting...'}
            {wsStatus === 'disconnected' && 'Disconnected'}
            {wsStatus === 'error' && 'Connection Error'}
            {wsStatus === 'failed' && 'Connection Failed'}
            {reconnectAttempts > 0 && ` (Retry ${reconnectAttempts})`}
          </span>
        </div>

        {showHistory && (
          <div className="history-panel">
            <h3>Your Generation History</h3>
            <div className="history-list">
              {userHistory.length === 0 ? (
                <p className="no-history">No generations yet. Create your first video!</p>
              ) : (
                userHistory.map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="history-info">
                      <div className="history-title">
                        {item.pipeline_type === 'idea2video' ? '💡 Idea' :
                         item.pipeline_type === 'script2video' ? '📝 Script' : '📖 Novel'} → Video
                      </div>
                      <div className="history-meta">
                        {new Date(item.timestamp).toLocaleDateString()} • {item.style} • {item.quality}
                      </div>
                    </div>
                    <div className="history-status">
                      <span className={`status-badge ${item.status}`}>
                        {item.status === 'completed' ? '✅' : item.status === 'failed' ? '❌' : '⏳'}
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {showBatch && (
          <div className="batch-panel">
            <h3>Batch Processing</h3>

            <div className="batch-sections">
              <div className="batch-create">
                <h4>Create New Batch</h4>
                <div className="batch-form">
                  <input
                    type="text"
                    placeholder="Batch name (optional)"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    className="batch-name-input"
                  />
                  <button onClick={addBatchJob} className="add-job-btn">
                    ➕ Add Current Job to Batch
                  </button>
                </div>

                {batchJobs.length > 0 && (
                  <div className="batch-jobs">
                    <h5>Jobs in Batch ({batchJobs.length})</h5>
                    {batchJobs.map((job, index) => (
                      <div key={index} className="batch-job-item">
                        <div className="job-info">
                          <span className="job-type">{job.pipeline_type}</span>
                          <span className="job-desc">
                            {job.pipeline_type === 'idea2video' ? job.idea.substring(0, 50) + '...' :
                             job.script.substring(0, 50) + '...'}
                          </span>
                        </div>
                        <button
                          onClick={() => removeBatchJob(index)}
                          className="remove-job-btn"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                    <button onClick={createBatch} className="create-batch-btn">
                      🚀 Create Batch ({batchJobs.length} jobs)
                    </button>
                  </div>
                )}
              </div>

              <div className="batch-list">
                <h4>Your Batches</h4>
                <div className="batches-container">
                  {userBatches.length === 0 ? (
                    <p className="no-batches">No batches yet. Create your first batch!</p>
                  ) : (
                    userBatches.map((batch) => (
                      <div key={batch.batch_id} className="batch-item">
                        <div className="batch-info">
                          <div className="batch-name">{batch.name}</div>
                          <div className="batch-meta">
                            {batch.total_jobs} jobs • {batch.status} • {new Date(batch.created_at).toLocaleDateString()}
                          </div>
                          <div className="batch-progress">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${batch.total_jobs > 0 ? (batch.progress.completed / batch.total_jobs) * 100 : 0}%`
                                }}
                              ></div>
                            </div>
                            <span className="progress-text">
                              {batch.progress.completed}/{batch.total_jobs} completed
                            </span>
                          </div>
                        </div>
                        <div className="batch-status">
                          <span className={`status-badge ${batch.status}`}>
                            {batch.status === 'completed' && '✅'}
                            {batch.status === 'processing' && '🔄'}
                            {batch.status === 'queued' && '⏳'}
                            {batch.status === 'failed' && '❌'}
                            {batch.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="main-content">
        <form onSubmit={handleSubmit} className="video-form">
          <div className="form-section">
            <h3>Authentication</h3>
            <div className="form-group">
              <label htmlFor="apiKey">API Key:</label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="form-control"
              />
              <small className="form-help">Required for accessing the video generation service</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pipeline">Pipeline Type:</label>
            <select
              id="pipeline"
              value={pipelineType}
              onChange={(e) => setPipelineType(e.target.value)}
            >
              <option value="idea2video">🎯 Idea to Video</option>
              <option value="script2video">📝 Script to Video</option>
              <option value="novel2video">📖 Novel to Video</option>
              <option value="cameo">📸 Photo Cameo</option>
            </select>
          </div>

          {pipelineType === 'idea2video' && (
            <div className="form-group">
              <label htmlFor="idea">Video Idea:</label>
              <textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your video idea..."
                required
                rows="4"
              />
            </div>
          )}

          {pipelineType === 'script2video' && (
            <div className="form-group">
              <label htmlFor="script">Screenplay Script:</label>
              <textarea
                id="script"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your screenplay script here... (EXT., INT., character names, dialogue)"
                required
                rows="8"
              />
              <small className="form-help">Use standard screenplay format with scene headings, action lines, character names, and dialogue.</small>
            </div>
          )}

          {pipelineType === 'novel2video' && (
            <>
              <div className="form-group">
                <label htmlFor="novel">Novel Text:</label>
                <textarea
                  id="novel"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Paste your novel text here..."
                  rows="8"
                />
                <small className="form-help">Paste your novel text or upload a file below.</small>
              </div>

              <FileUpload
                label="Or upload a novel file:"
                accept=".txt,.md,.pdf,.docx"
                file={novelFile}
                setFile={setNovelFile}
                error={fileErrors.novel}
                setError={(error) => setFileErrors({...fileErrors, novel: error})}
                fileType="novel"
              />
            </>
          )}

          {pipelineType === 'cameo' && (
            <div className="form-group">
              <label htmlFor="cameo">Cameo Description:</label>
              <textarea
                id="cameo"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe the cameo scene you want to create..."
                required
                rows="4"
              />
              <small className="form-help">Describe the scene where your photo will appear as a cameo.</small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="requirement">Requirements:</label>
            <input
              id="requirement"
              type="text"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="e.g., For children, 3 scenes max"
            />
          </div>

          <div className="form-group">
            <label htmlFor="style">Style:</label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="Realistic">Realistic</option>
              <option value="Cartoon">Cartoon</option>
              <option value="Anime">Anime</option>
              <option value="Cinematic">Cinematic</option>
            </select>
          </div>

          <div className="form-section">
            <h3>AI Tools & Quality Settings</h3>
            <div className="quality-grid">
              <div className="form-group">
                <label htmlFor="imageGenerator">Image Generator:</label>
                <select
                  id="imageGenerator"
                  value={imageGenerator}
                  onChange={(e) => setImageGenerator(e.target.value)}
                >
                  <option value="google">Google Imagen (High Quality)</option>
                  <option value="yunwu_nanobanana">Yunwu Nanobanana (Fast)</option>
                  <option value="yunwu_doubao">Yunwu Doubao (Balanced)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="videoGenerator">Video Generator:</label>
                <select
                  id="videoGenerator"
                  value={videoGenerator}
                  onChange={(e) => setVideoGenerator(e.target.value)}
                >
                  <option value="google">Google Veo (High Quality)</option>
                  <option value="yunwu_veo">Yunwu Veo (Fast)</option>
                  <option value="yunwu_doubao">Yunwu Doubao (Balanced)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quality">Quality Preset:</label>
                <select
                  id="quality"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option value="fast">Fast (720p, ~50MB)</option>
                  <option value="standard">Standard (1080p, ~200MB)</option>
                  <option value="high">High Quality (4K, ~1GB)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="resolution">Resolution:</label>
                <select
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                >
                  <option value="720p">720p HD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="1440p">1440p QHD</option>
                  <option value="4K">4K Ultra HD</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="format">Format:</label>
                <select
                  id="format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="mp4">MP4 (Universal)</option>
                  <option value="webm">WebM (Web Optimized)</option>
                  <option value="mov">MOV (Apple)</option>
                </select>
              </div>
            </div>
          </div>

          {(pipelineType === 'script2video' || pipelineType === 'idea2video') && (
            <FileUpload
              label="Script File (optional)"
              accept=".txt,.md"
              file={scriptFile}
              setFile={setScriptFile}
              error={fileErrors.script}
              setError={(error) => setFileErrors(prev => ({ ...prev, script: error }))}
              fileType="script"
            />
          )}

          {pipelineType === 'novel2video' && (
            <FileUpload
              label="Novel File"
              accept=".txt,.md,.pdf,.docx"
              file={novelFile}
              setFile={setNovelFile}
              error={fileErrors.novel}
              setError={(error) => setFileErrors(prev => ({ ...prev, novel: error }))}
              fileType="novel"
            />
          )}

          <FileUpload
            label={pipelineType === 'cameo' ? "Your Photo (required)" : "Photo File (optional)"}
            accept="image/*"
            file={photoFile}
            setFile={setPhotoFile}
            error={fileErrors.photo}
            setError={(error) => setFileErrors(prev => ({ ...prev, photo: error }))}
            fileType="photo"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`generate-btn touch-target mobile-optimized-btn btn-ripple hover-lift click-scale focus-ring ${isLoading ? 'loading' : ''}`}
            onClick={() => isMobile() && triggerHapticFeedback('heavy')}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Starting...
              </>
            ) : (
              <>
                {pipelineType === 'idea2video' && '🎯 Generate from Idea'}
                {pipelineType === 'script2video' && '📝 Generate from Script'}
                {pipelineType === 'novel2video' && '📖 Generate from Novel'}
                {pipelineType === 'cameo' && '📸 Create Cameo Video'}
              </>
            )}
          </button>
        </form>

        {jobStatus && jobStatus.steps && (
          <PipelineVisualizer
            steps={jobStatus.steps}
            currentStep={jobStatus.steps.findIndex(step => step.status === 'in_progress')}
            progress={jobStatus.progress || 0}
          />
        )}

        {jobStatus && !jobStatus.steps && (
          <div className="job-status">
            <h3>Generation Status</h3>
            <p><strong>Status:</strong> {jobStatus.status}</p>
            <p><strong>Message:</strong> {jobStatus.message}</p>
            {jobStatus.progress !== undefined && (
              <div className="progress-section">
                <div className="overall-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${jobStatus.progress}%` }}
                    ></div>
                    <span className="progress-text">{jobStatus.progress}% Complete</span>
                  </div>
                </div>

                {jobStatus.steps && (
                  <div className="pipeline-visualization">
                    <h4>Generation Pipeline</h4>
                    <div className="pipeline-flow">
                      {jobStatus.steps.map((step, index) => (
                        <React.Fragment key={index}>
                          <div className={`pipeline-step ${step.status}`}>
                            <div className="step-circle">
                              {step.status === 'completed' && '✓'}
                              {step.status === 'in_progress' && '⟳'}
                              {step.status === 'pending' && '○'}
                            </div>
                            <div className="step-label">{step.name}</div>
                            <div className="step-duration">{step.estimated_time}s</div>
                          </div>
                          {index < jobStatus.steps.length - 1 && (
                            <div className="pipeline-arrow">→</div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="steps-list">
                      <h5>Detailed Steps</h5>
                      <div className="steps-container">
                        {jobStatus.steps.map((step, index) => (
                          <div key={index} className={`step-item ${step.status}`}>
                            <div className="step-icon">
                              {step.status === 'completed' && '✅'}
                              {step.status === 'in_progress' && '🔄'}
                              {step.status === 'pending' && '⏳'}
                            </div>
                            <div className="step-content">
                              <div className="step-name">{step.name}</div>
                              <div className="step-time">~{step.estimated_time}s</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {jobStatus.current_step && (
                  <div className="current-step">
                    <strong>Current:</strong> {jobStatus.current_step}
                  </div>
                )}
              </div>
            )}
            {jobStatus.status === 'completed' && jobId && (
              <div className="video-preview">
                <h4>🎬 Generated Video Preview</h4>
                <video
                  controls
                  className="video-player"
                  src={`http://localhost:8000/job/${jobId}/download`}
                  type="video/mp4"
                >
                  Your browser does not support the video tag.
                </video>
                <div className="video-actions">
                  <button onClick={() => openVideoEditor(`http://localhost:8000/job/${jobId}/download`)} className="edit-video-btn">
                    ✏️ Edit Video
                  </button>
                  <button onClick={handleDownload} className="download-btn">
                    📥 Download Video
                  </button>
                </div>

                <div className="feedback-section">
                  <h4>Rate Your Video</h4>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${rating >= star ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <textarea
                    placeholder="Tell us what you think..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows="3"
                    className="feedback-textarea"
                  />
                  <button
                    onClick={async () => {
                      try {
                        const apiBase = getApiBaseUrl();
                        const headers = {};
                        if (apiKey) {
                          headers['Authorization'] = `Bearer ${apiKey}`;
                        }
                        await axios.post(`${apiBase}/user/${userId}/feedback`, {
                          job_id: jobId,
                          rating: rating,
                          comments: feedback,
                          categories: [] // Could be expanded with categories
                        });
                        alert('Thank you for your feedback!');
                        setRating(0);
                        setFeedback('');
                        // Reload user data to update stats
                        loadUserData(userId);
                      } catch (error) {
                        console.error('Error submitting feedback:', error);
                        alert('Error submitting feedback. Please try again.');
                      }
                    }}
                    className="feedback-btn"
                    disabled={!rating && !feedback.trim()}
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            )}

            {jobStatus.status === 'failed' && (
              <div className="error-recovery">
                <p>❌ Video generation failed. Would you like to try again?</p>
                <button
                  onClick={() => {
                    setJobId(null);
                    setJobStatus(null);
                  }}
                  className="retry-btn"
                >
                  🔄 Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Video Editor Modal */}
      {showVideoEditor && editingVideo && (
        <div className="video-editor-modal">
          <div className="video-editor-overlay" onClick={closeVideoEditor}></div>
          <div className="video-editor-content">
            <div className="video-editor-header">
              <h2>🎬 Video Editor</h2>
              <button onClick={closeVideoEditor} className="close-editor-btn">✕</button>
            </div>

            <div className="video-editor-body">
              <div className="video-preview-section">
                <div className="video-container">
                  <video
                    controls
                    className="editor-video-player"
                    src={editingVideo}
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Text overlays preview */}
                  {textOverlays.map(overlay => (
                    <div
                      key={overlay.id}
                      className="text-overlay-preview"
                      style={{
                        left: `${overlay.x}%`,
                        top: `${overlay.y}%`,
                        fontSize: `${overlay.fontSize}px`,
                        color: overlay.color,
                        WebkitTextStroke: `${overlay.strokeWidth}px ${overlay.strokeColor}`
                      }}
                    >
                      {overlay.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="editor-controls">
                <div className="control-section">
                  <h3>Trim Video</h3>
                  <div className="trim-controls">
                    <label>
                      Start: {videoTrimStart}%
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={videoTrimStart}
                        onChange={(e) => setVideoTrimStart(Number(e.target.value))}
                        className="trim-slider"
                      />
                    </label>
                    <label>
                      End: {videoTrimEnd}%
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={videoTrimEnd}
                        onChange={(e) => setVideoTrimEnd(Number(e.target.value))}
                        className="trim-slider"
                      />
                    </label>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Text Overlays</h3>
                  <button onClick={addTextOverlay} className="add-overlay-btn">
                    ➕ Add Text
                  </button>

                  <div className="overlays-list">
                    {textOverlays.map(overlay => (
                      <div key={overlay.id} className="overlay-item">
                        <input
                          type="text"
                          value={overlay.text}
                          onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                          className="overlay-text-input"
                        />
                        <input
                          type="color"
                          value={overlay.color}
                          onChange={(e) => updateTextOverlay(overlay.id, { color: e.target.value })}
                          className="color-picker"
                        />
                        <button
                          onClick={() => removeTextOverlay(overlay.id)}
                          className="remove-overlay-btn"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="control-section">
                  <h3>Effects</h3>
                  <select
                    value={selectedEffect}
                    onChange={(e) => setSelectedEffect(e.target.value)}
                    className="effect-selector"
                  >
                    <option value="none">No Effect</option>
                    <option value="grayscale">Grayscale</option>
                    <option value="sepia">Sepia</option>
                    <option value="brightness">Brightness</option>
                    <option value="contrast">High Contrast</option>
                  </select>
                </div>

                <div className="editor-actions">
                  <button onClick={applyVideoEdits} className="apply-edits-btn">
                    ✅ Apply Edits
                  </button>
                  <button onClick={closeVideoEditor} className="cancel-edits-btn">
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {isMobile() && (
        <nav className="mobile-nav">
          <div
            className={`nav-item ${showHistory ? 'active' : ''}`}
            onClick={() => handleMobileNav('history')}
          >
            <span className="nav-icon">📚</span>
            <span className="nav-label">History</span>
          </div>
          <div
            className={`nav-item ${showBatch ? 'active' : ''}`}
            onClick={() => handleMobileNav('batch')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-label">Batch</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </div>
        </nav>
      )}
    </div>
  );
}

export default App;
