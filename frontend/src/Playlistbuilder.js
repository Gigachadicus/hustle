import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlaylistBuilder.css';

const WorkoutCards = () => {
  const [workoutData, setWorkoutData] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching data from backend
    // Replace this with your actual API call
    fetchWorkoutData();
  }, []);

  const fetchWorkoutData = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/workouts');
      const data = await response.json();
      
      setWorkoutData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workout data:', error);
      setLoading(false);
    }
  };

  const convertBufferToImage = (buffer) => {
    // Convert buffer to base64 image URL
    if (!buffer) return null;
    const base64String = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return `data:image/jpeg;base64,${base64String}`;
  };

  const removeDotJpg = (filename) => {
    return filename.replace('.jpg', '').replace('.jpeg', '').replace('.png', '');
  };

  const addToPlaylist = (workout) => {
    if (!playlist.find(item => item.id === workout.id)) {
      setPlaylist([...playlist, workout]);
    }
  };

  const removeFromPlaylist = (workoutId) => {
    setPlaylist(playlist.filter(item => item.id !== workoutId));
  };

  const clearPlaylist = () => {
    setPlaylist([]);
  };

  const isInPlaylist = (workoutId) => {
    return playlist.some(item => item.id === workoutId);
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const savePlaylist = () => {
    if (playlistName.trim() && playlist.length > 0) {
      const playlistData = {
        name: playlistName,
        exercises: playlist.map(item => ({
          id: item.id,
          name: removeDotJpg(item.name),
          coordinates: item.coordinates,
          image: item.image,
          level: item.level
        })),
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage
      const savedPlaylists = JSON.parse(localStorage.getItem('workoutPlaylists') || '[]');
      savedPlaylists.push(playlistData);
      localStorage.setItem('workoutPlaylists', JSON.stringify(savedPlaylists));
      
      setShowSaveModal(false);
      setPlaylistName('');
      alert('Playlist saved successfully!');
    } else {
      alert('Please enter a playlist name and add at least one exercise.');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const proceedToExercise = () => {
    if (playlist.length === 0) {
      alert('Please add at least one exercise to the playlist.');
      return;
    }
    
    const exerciseData = playlist.map(item => ({
      id: item.id,
      name: removeDotJpg(item.name),
      coordinates: item.coordinates,
      image: item.image,
      level: item.level
    }));
    
    // Navigate to exercise page with playlist data
    navigate('/exercise', { state: { exercises: exerciseData } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading exercises...</p>
      </div>
    );
  }

  return (
    <div className="workout-cards-container">
      <header className="page-header">
        <h1>Choose Your Exercises</h1>
        <p>Select exercises to create your custom workout playlist</p>
      </header>

      <div className="playlist-section">
        <div className="playlist-header">
          <h2>Your Playlist ({playlist.length})</h2>
          <div className="playlist-actions">
            <button 
              className="btn btn-secondary" 
              onClick={clearPlaylist}
              disabled={playlist.length === 0}
            >
              Clear All
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={playlist.length === 0}
            >
              Save Playlist
            </button>
          </div>
        </div>
        
        {playlist.length > 0 && (
          <div className="playlist-preview">
            {playlist.map(item => (
              <span key={item.id} className="playlist-item">
                {removeDotJpg(item.name)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="cards-grid">
        {workoutData.map(workout => (
          <div key={workout.id} className="workout-card">
            <div className="card-image">
              {workout.image ? (
                <img 
                  src={convertBufferToImage(workout.image)} 
                  alt={removeDotJpg(workout.name)}
                />
              ) : (
                <div className="placeholder-image">
                  <span>No Image</span>
                </div>
              )}
              <div className="level-badge">{workout.level}</div>
            </div>
            
            <div className="card-content">
              <h3 className="card-title">{removeDotJpg(workout.name)}</h3>
              
              <div className="card-actions">
                {isInPlaylist(workout.id) ? (
                  <button 
                    className="btn btn-remove"
                    onClick={() => removeFromPlaylist(workout.id)}
                  >
                    - Remove
                  </button>
                ) : (
                  <button 
                    className="btn btn-add"
                    onClick={() => addToPlaylist(workout)}
                  >
                    + Add
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-actions">
        <button className="btn btn-cancel" onClick={handleCancel}>
          Cancel
        </button>
        <button 
          className="btn btn-proceed" 
          onClick={proceedToExercise}
          disabled={playlist.length === 0}
        >
          Proceed to Exercise ({playlist.length})
        </button>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Save Playlist</h3>
            <input
              type="text"
              placeholder="Enter playlist name..."
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="playlist-name-input"
            />
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={savePlaylist}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCards;