import React, { useEffect, useRef, useState } from 'react';
import './exercise.css';
import { Pose } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';
import sample from './test.jpg'

function exercise() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [similarity, setSimilarity] = useState(0);
  const [debug, setDebug] = useState({ comprehensive: 0, simple: 0 });
  const [exercises, setExercises] = useState([]);
  
  useEffect(() => {
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

    pose.onResults(onResults);

    let camera = null;
    if (videoRef.current) {
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480
      });
      camera.start().then(() => setLoading(false)); 
    }

    async function onResults(results) {
      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.poseLandmarks) {
        // Draw connectors for the body
        drawConnectors(canvasCtx, results.poseLandmarks, Pose.POSE_CONNECTIONS, { color: 'white', lineWidth: 2 });
        drawLandmarks(canvasCtx, results.poseLandmarks, { color: 'cyan', lineWidth: 1 });

        // Draw single dot for nose landmark (index 0)
        const nose = results.poseLandmarks[0];
        if (nose) {
          canvasCtx.beginPath();
          canvasCtx.arc(nose.x * canvasRef.current.width, nose.y * canvasRef.current.height, 5, 0, 2 * Math.PI);
          canvasCtx.fillStyle = 'red';
          canvasCtx.fill();
        }
      }

      canvasCtx.restore();

      // Send landmarks to backend (replace URL later)
      try {
        const response = await fetch('http://localhost:5000/receive-coords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pose: results.poseLandmarks })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSimilarity(data.similarity);
          setDebug({ comprehensive: data.comprehensive, simple: data.simple });
        }
      } catch (err) {
        console.error('Failed to send landmarks', err);
      }
    }

    return () => {
      if (camera) camera.stop();
    };
  }, []);

  return (
    <div className="App" style={{ display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', color: 'white',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 10
          }}>
            Loading model...
          </div>
        )}
        <video ref={videoRef} style={{ display: 'none' }} />
        <canvas ref={canvasRef} width="640" height="480" style={{ width: '100%' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, color: 'white', fontSize: '16px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px' }}>
          <div>Overall Similarity: {similarity.toFixed(1)}%</div>
          <div>Comprehensive: {debug.comprehensive.toFixed(1)}%</div>
          <div>Simple: {debug.simple.toFixed(1)}%</div>
        </div>
      </div>
      <div style={{ flex: 1, backgroundColor: '#222' }}>
        <img src={sample} alt="bingchilling" />
      </div>
    </div>
  );
}

export default exercise;