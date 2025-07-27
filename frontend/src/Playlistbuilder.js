import React, { useState, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PlaylistBuilder.css';

const Playlistbuilder = () => {
  const location = useLocation();              
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState(location.state?.token || null);  
  const [username, setUsername] = useState(location.state?.username || '');       

  const [workoutData, setWorkoutData] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSavedPlaylists, setShowSavedPlaylists] = useState(false);
  const [viewingPlaylist, setViewingPlaylist] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const getUserStorageKey = (username) => `workoutPlaylists_${username}`;


useEffect(() => {
  loadSavedPlaylists(); 
}, []);

useEffect(() => {
  if (accessToken) {
    fetchWorkoutData();
  }
}, [accessToken]);

useEffect(() => {
  if (!accessToken) {
    navigate('/login');
  }
}, [accessToken, navigate]);


  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadSavedPlaylists = () => {
    const saved = JSON.parse(localStorage.getItem(getUserStorageKey(username)) || '[]');
    setSavedPlaylists(saved);
  };

const refreshToken = async () => {
  try {
    const response = await fetch('http://localhost:5000/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) return null;

    const resData = await response.json();
    return resData.accessToken || null;
  } catch (error) {
    console.error('Error during token refresh:', error);
    return null;
  }
};

const fetchWorkoutData = async () => {
  try {
    const response = await fetch('http://localhost:5000/workouts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      const newToken = await refreshToken();
      if (newToken) {
        setAccessToken(newToken); 
        return; 
      } else {
        navigate('/login');
      }
      return;
    }

    const data = await response.json();
    setWorkoutData(data.assets);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const convertBufferToImage = (buffer) => {
  if (!buffer || !buffer.data || !Array.isArray(buffer.data)) return null;

  try {
    const uint8Array = new Uint8Array(buffer.data);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64String = btoa(binary);
    return `data:image/jpeg;base64,${base64String}`;
  } catch (err) {
    console.error("Image conversion failed:", err);
    return null;
  }
};

  const removeDotJpg = (filename) => {
    return filename.replace('.jpg', '').replace('.jpeg', '').replace('.png', '');
  };

  const addToPlaylist = (workout) => {
    // Create a unique entry for each addition (using timestamp for uniqueness)
    const playlistItem = {
      ...workout,
      playlistId: Date.now() + Math.random() // Unique identifier for playlist items
    };
    setPlaylist([...playlist, playlistItem]);
  };

  const removeFromPlaylist = (workoutId) => {
    // Find the last occurrence of this exercise and remove it
    const lastIndex = playlist.map(item => item.id).lastIndexOf(workoutId);
    if (lastIndex !== -1) {
      const newPlaylist = [...playlist];
      newPlaylist.splice(lastIndex, 1);
      setPlaylist(newPlaylist);
    }
  };

  const clearPlaylist = () => {
    setPlaylist([]);
  };

  const isInPlaylist = (workoutId) => {
    return playlist.some(item => item.id === workoutId);
  };

  const getExerciseCount = (workoutId) => {
    return playlist.filter(item => item.id === workoutId).length;
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const savePlaylist = () => {
    if (playlistName.trim() && playlist.length > 0) {
      const playlistData = {
        id: Date.now(), // Add unique ID for deletion
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
      const savedPlaylists = JSON.parse(localStorage.getItem(getUserStorageKey(username)) || '[]');
      savedPlaylists.push(playlistData);
      localStorage.setItem(getUserStorageKey(username), JSON.stringify(savedPlaylists));

      
      // Update state
      setSavedPlaylists(savedPlaylists);
      
      setShowSaveModal(false);
      setPlaylistName('');
      showNotification(`Playlist "${playlistName}" saved successfully!`);
    } else {
      showNotification('Please enter a playlist name and add at least one exercise.');
    }
  };

  const deleteSavedPlaylist = (playlistId) => {
    const playlistToDelete = savedPlaylists.find(p => p.id === playlistId);
    if (window.confirm(`Are you sure you want to delete "${playlistToDelete?.name}"?`)) {
      const updatedPlaylists = savedPlaylists.filter(playlist => playlist.id !== playlistId);
      localStorage.setItem(getUserStorageKey(username), JSON.stringify(updatedPlaylists));
      setSavedPlaylists(updatedPlaylists);
      showNotification(`Playlist "${playlistToDelete?.name}" deleted successfully!`, 'error');
      if (viewingPlaylist && viewingPlaylist.id === playlistId) {
        setViewingPlaylist(null);
      }
    }
  };

  const loadSavedPlaylist = (savedPlaylist) => {
    // Load the saved playlist into current playlist
    const loadedExercises = savedPlaylist.exercises.map(exercise => ({
      ...exercise,
      playlistId: Date.now() + Math.random() // Give each loaded exercise a unique playlist ID
    }));
    setPlaylist(loadedExercises);
    setShowSavedPlaylists(false);
    showNotification(`Loaded playlist: ${savedPlaylist.name}`);
  };

  const handleCancel = () => {
    navigate('/');
  };

  const proceedToExercise = () => {
    if (playlist.length === 0) {
      showNotification('Please add at least one exercise to the playlist.', 'warning');
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
      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <span>{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      <header className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Choose Your Exercises</h1>
            <p>Select exercises to create your custom workout playlist</p>
          </div>
          <button 
            className="btn btn-profile"
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>
        </div>
      </header>

      <div className="playlist-section">
        <div className="playlist-header">
          <h2>Your Playlist ({playlist.length})</h2>
          <div className="playlist-actions">
            <button 
              className="btn btn-info" 
              onClick={() => setShowSavedPlaylists(true)}
              disabled={savedPlaylists.length === 0}
            >
              View Saved ({savedPlaylists.length})
            </button>
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
            {playlist.map((item, index) => (
              <span key={item.playlistId || index} className="playlist-item">
                {removeDotJpg(item.name)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="cards-grid">
        {workoutData.map(workout => {
          const exerciseCount = getExerciseCount(workout.id);
          return (
            <div key={workout.id} className="workout-card">
              <div className="card-image">
                {workout.image ? (
                  <img src={convertBufferToImage(workout.image)} 
                  alt={removeDotJpg(workout.name)} />
                ) : (
                  <div className="placeholder-image">
                    <span>No Image</span>
                  </div>
                )}
                <div className="level-badge">{workout.level}</div>
                {exerciseCount > 0 && (
                  <div className="count-badge">{exerciseCount}</div>
                )}
              </div>
              
              <div className="card-content">
                <h3 className="card-title">{removeDotJpg(workout.name)}</h3>
                
                <div className="card-actions">
                  <button 
                    className="btn btn-add"
                    onClick={() => addToPlaylist(workout)}
                  >
                    + Add
                  </button>
                  {isInPlaylist(workout.id) && (
                    <button 
                      className="btn btn-remove"
                      onClick={() => removeFromPlaylist(workout.id)}
                    >
                      - Remove Latest
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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

      {/* Saved Playlists Modal */}
      {showSavedPlaylists && (
        <div className="modal-overlay">
          <div className="modal saved-playlists-modal">
            {!viewingPlaylist ? (
              <>
                <h3>Saved Playlists</h3>
                {savedPlaylists.length === 0 ? (
                  <p>No saved playlists found.</p>
                ) : (
                  <div className="saved-playlists-list">
                    {savedPlaylists.map(savedPlaylist => (
                      <div key={savedPlaylist.id} className="saved-playlist-item">
                        <div className="playlist-info">
                          <h4>{savedPlaylist.name}</h4>
                          <p>{savedPlaylist.exercises.length} exercises</p>
                          <small>Created: {new Date(savedPlaylist.createdAt).toLocaleDateString()}</small>
                        </div>
                        <div className="playlist-item-actions">
                          <button 
                            className="btn btn-info btn-small"
                            onClick={() => setViewingPlaylist(savedPlaylist)}
                          >
                            View
                          </button>
                          <button 
                            className="btn btn-primary btn-small"
                            onClick={() => loadSavedPlaylist(savedPlaylist)}
                          >
                            Load
                          </button>
                          <button 
                            className="btn btn-danger btn-small"
                            onClick={() => deleteSavedPlaylist(savedPlaylist.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="modal-actions">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowSavedPlaylists(false)}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="playlist-detail-header">
                  <button 
                    className="btn btn-back"
                    onClick={() => setViewingPlaylist(null)}
                  >
                    ← Back
                  </button>
                  <h3>{viewingPlaylist.name}</h3>
                  <div className="playlist-detail-actions">
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => loadSavedPlaylist(viewingPlaylist)}
                    >
                      Load This Playlist
                    </button>
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => deleteSavedPlaylist(viewingPlaylist.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="playlist-detail-info">
                  <p><strong>Exercises:</strong> {viewingPlaylist.exercises.length}</p>
                  <p><strong>Created:</strong> {new Date(viewingPlaylist.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="playlist-exercises-grid">
                  {viewingPlaylist.exercises.map((exercise, index) => (
                    <div key={index} className="playlist-exercise-card">
                      <div className="exercise-image">
                        {exercise.image ? (
                          <img src={convertBufferToImage(exercise.image)} 
                          alt={exercise.name} />
                        ) : (
                          <div className="placeholder-image">
                            <span>No Image</span>
                          </div>
                        )}
                        <div className="level-badge">{exercise.level}</div>
                      </div>
                      <div className="exercise-info">
                        <h4>{exercise.name}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlistbuilder;