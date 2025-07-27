import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './exercise.css';

function Exercise() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [similarity, setSimilarity] = useState(0);
  const [corrections, setCorrections] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Get exercises from navigation state
  useEffect(() => {
    if (location.state?.exercises) {
      setExercises(location.state.exercises);
    } else {
      navigate('/playlistbuilder');
    }
  }, [location.state, navigate]);

  const currentExercise = exercises[currentExerciseIndex];

  // API call function
  const sendPoseData = async (poseLandmarks) => {
    if (!currentExercise?.coordinates) return;

    try {
      const response = await fetch('http://localhost:5000/receive-coords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pose: poseLandmarks,
          targetCoordinates: currentExercise.coordinates,
          name: currentExercise.name
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSimilarity(data.similarity || 0);
        setCorrections(data.corrections || []);
      }
    } catch (error) {
      console.error('API call failed:', error);
    }
  };

  // Initialize MediaPipe
  useEffect(() => {
    if (!currentExercise) return;

    const initMediaPipe = async () => {
      try {
        // Use the working MediaPipe imports
        const { Pose } = await import('@mediapipe/pose');
        const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils');
        const { Camera } = await import('@mediapipe/camera_utils');

        // Create pose instance
        const pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        // Handle pose results
        pose.onResults((results) => {
          if (!canvasRef.current) return;

          const canvasCtx = canvasRef.current.getContext('2d');
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Draw the camera feed
          if (results.image) {
            canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
          }

          // Draw pose if detected
          if (results.poseLandmarks) {
            drawConnectors(canvasCtx, results.poseLandmarks, Pose.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
            drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
            
            // Send data to backend
            sendPoseData(results.poseLandmarks);
          }

          canvasCtx.restore();
        });

        poseRef.current = pose;

        // Initialize camera
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current && videoRef.current) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });

        cameraRef.current = camera;
        await camera.start();
        setLoading(false);

      } catch (error) {
        console.error('MediaPipe initialization failed:', error);
        setLoading(false);
      }
    };

    initMediaPipe();

    // Cleanup function
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      poseRef.current = null;
    };
  }, [currentExercise]);

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      setShowCelebration(true);
      setTimeout(() => navigate('/'), 3000);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const convertBufferToImage = (buffer) => {
    if (!buffer?.data) return null;
    try {
      const uint8Array = new Uint8Array(buffer.data);
      const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
      return `data:image/jpeg;base64,${btoa(binary)}`;
    } catch (err) {
      console.error("Image conversion failed:", err);
      return null;
    }
  };

  if (showCelebration) {
    return (
      <div className="celebration-screen">
        <div className="celebration-content">
          <div className="celebration-animation">🎉</div>
          <h1 className="celebration-title">Workout Complete!</h1>
          <p className="celebration-message">You completed {exercises.length} exercises!</p>
          <div className="celebration-stats">
            <div className="stat-item">
              <div className="stat-number">{exercises.length}</div>
              <div className="stat-label">Exercises Completed</div>
            </div>
          </div>
          <div className="celebration-footer">
            <p>Redirecting to home...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading exercises...</p>
      </div>
    );
  }

  return (
    <div className="exercise-container">
      {/* Header */}
      <div className="exercise-header">
        <div className="exercise-info">
          <h1 className="exercise-title">{currentExercise.name}</h1>
          <div className="exercise-progress">
            <span className="progress-text">Exercise {currentExerciseIndex + 1} of {exercises.length}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        <button className="home-btn" onClick={() => navigate('/')}>
          🏠 Home
        </button>
      </div>

      <div className="exercise-content">
        {/* Camera Section */}
        <div className="camera-section">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Starting camera...</p>
            </div>
          )}
          
          <video ref={videoRef} style={{ display: 'none' }} autoPlay playsInline />
          <canvas ref={canvasRef} width="640" height="480" className="pose-canvas" />
          
          {/* Similarity Display */}
          <div className={`similarity-display ${similarity > 80 ? 'high-match' : ''}`}>
            <div className="similarity-main">
              <span className="similarity-value">{similarity.toFixed(1)}%</span>
              <span className="similarity-label">Match</span>
            </div>
          </div>

          {/* Corrections Panel */}
          <div className="corrections-panel">
            <div className="corrections-header">
              <h4>💡 Tips</h4>
            </div>
            {corrections.length === 0 ? (
              <div className="no-corrections">Looking good! 👍</div>
            ) : (
              <div className="corrections-list">
                {corrections.map((correction, index) => (
                  <div key={index} className="correction-item">
                    <span className="correction-icon">→</span>
                    <span className="correction-text">{correction}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reference Section */}
        <div className="reference-section">
          <div className="reference-header">
            <h3>Target Pose</h3>
            <div className="exercise-level">Exercise</div>
          </div>
          <div className="reference-image-container">
            {currentExercise.image ? (
              <img 
                src={convertBufferToImage(currentExercise.image)} 
                alt={currentExercise.name}
                className="reference-image"
              />
            ) : (
              <div className="placeholder-image">No Reference Image</div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="exercise-controls">
        <button 
          className="control-btn"
          onClick={handlePreviousExercise}
          disabled={currentExerciseIndex === 0}
        >
          ← Previous
        </button>
        
        <div className="exercise-indicators">
          {exercises.map((_, index) => (
            <div 
              key={index} 
              className={`indicator ${index === currentExerciseIndex ? 'active' : ''} ${index < currentExerciseIndex ? 'completed' : ''}`}
            />
          ))}
        </div>
        
        <button 
          className="control-btn next-btn" 
          onClick={handleNextExercise}
        >
          {currentExerciseIndex === exercises.length - 1 ? 'Finish' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

export default Exercise;