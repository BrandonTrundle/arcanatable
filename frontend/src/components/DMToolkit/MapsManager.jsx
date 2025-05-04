import React, { useState, useEffect } from 'react';
import '../../styles/MapsManager.css';
import { uploadMapImage, saveMap } from '../../services/mapService';
import { updateMap, deleteMap } from '../../services/mapService';
import { useUserContext } from '../../context/UserContext';
import axios from 'axios';
import MapEditor from './MapEditor';


const MapsManager = () => {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [newMap, setNewMap] = useState({
    name: '',
    width: '',
    height: '',
    image: null,
    imageUrl: '',
    previewUrl: ''
  });

  const { user } = useUserContext();

  // ✅ Load maps from backend
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const res = await axios.get('/api/dmtoolkit', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const mapItems = res.data.filter(item => item.toolkitType === 'Map');
        setMaps(mapItems);
      } catch (err) {
        console.error('Failed to load maps:', err);
      }
    };

    if (user?.token) {
      fetchMaps();
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const previewUrl = URL.createObjectURL(file);

      const img = new Image();
      img.onload = async () => {
        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;

        const imageUrl = await uploadMapImage(file);

        setNewMap(prev => ({
          ...prev,
          image: file,
          imageUrl,
          previewUrl,
          imageWidth,
          imageHeight
        }));

        console.log(`📐 Image dimensions: ${imageWidth} x ${imageHeight}`);
      };

      img.src = previewUrl;
    } catch (err) {
      console.error('Image upload failed', err);
    }
  };

  const handleChange = (field, value) => {
    setNewMap(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMap = async () => {
    const { name, width, height, imageUrl } = newMap;
    if (!name || !width || !height || !imageUrl) return;

    try {
      const savedMap = await saveMap({ name, width, height, imageUrl }, user.token);
      setMaps(prev => [...prev, savedMap]);
      setNewMap({ name: '', width: '', height: '', image: null, imageUrl: '', previewUrl: '' });
    } catch (err) {
      console.error('Failed to save map', err);
    }
  };

  return (
    <div className="maps-manager">
      <h2>🗺️ Map Manager</h2>

      <div className="map-form">
        <input
          type="text"
          placeholder="Map Name"
          value={newMap.name}
          onChange={e => handleChange('name', e.target.value)}
        />
        <input
          type="number"
          placeholder="Width (squares)"
          value={newMap.width}
          onChange={e => handleChange('width', e.target.value)}
        />
        <input
          type="number"
          placeholder="Height (squares)"
          value={newMap.height}
          onChange={e => handleChange('height', e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleImageUpload} />

        {newMap.previewUrl && (
          <img src={newMap.previewUrl} alt="Map Preview" className="map-preview" />
        )}

        <button onClick={handleAddMap}>➕ Add Map</button>
      </div>

      <div className="saved-maps">
        <h3>Saved Maps</h3>
        {maps.length === 0 ? (
          <p>No maps added yet.</p>
        ) : (
          <ul>
            {maps.map((map) => (
                <li key={map._id} onClick={() => setSelectedMap(map)} style={{ cursor: 'pointer' }}>

  <input
    value={map.content.name}
    onChange={e => {
      const updated = { ...map, content: { ...map.content, name: e.target.value } };
      setMaps(prev => prev.map(m => m._id === map._id ? updated : m));
    }}
  />
  <input
    type="number"
    value={map.content.width}
    onChange={e => {
      const updated = { ...map, content: { ...map.content, width: parseInt(e.target.value) } };
      setMaps(prev => prev.map(m => m._id === map._id ? updated : m));
    }}
    style={{ width: '60px' }}
  />
  x
  <input
    type="number"
    value={map.content.height}
    onChange={e => {
      const updated = { ...map, content: { ...map.content, height: parseInt(e.target.value) } };
      setMaps(prev => prev.map(m => m._id === map._id ? updated : m));
    }}
    style={{ width: '60px' }}
  />
  <button onClick={async () => {
    try {
      await updateMap(map._id, { content: map.content }, user.token);
    } catch (err) {
      console.error('Failed to update map', err);
    }
  }}>💾</button>
  <button onClick={async () => {
    try {
      await deleteMap(map._id, user.token);
      setMaps(prev => prev.filter(m => m._id !== map._id));
    } catch (err) {
      console.error('Failed to delete map', err);
    }
  }}>🗑</button>
</li>

            ))}
          </ul>
        )}
      </div>
      {selectedMap && (
  <MapEditor map={selectedMap} onClose={() => setSelectedMap(null)} />
)}

    </div>
  );
};

export default MapsManager;
