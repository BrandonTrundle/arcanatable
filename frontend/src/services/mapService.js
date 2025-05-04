import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// 1. Upload map image
export const uploadMapImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_BASE}/uploads/maps`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.url; // returns imageUrl
};

// 2. Save map metadata to DM Toolkit
export const saveMap = async (mapData, token) => {
  const response = await axios.post(`${API_BASE}/dmtoolkit/maps/upload`, mapData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

// 3. Update an existing map
export const updateMap = async (mapId, updates, token) => {
  const response = await axios.patch(`${API_BASE}/dmtoolkit/${mapId}`, updates, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

// 4. Delete a map
export const deleteMap = async (mapId, token) => {
  const response = await axios.delete(`${API_BASE}/dmtoolkit/${mapId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response;
};
