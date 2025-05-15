import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

// 1. Upload map image
export const uploadMapImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`${API_BASE}/uploads/maps`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.url; // returns imageUrl
};

// 2. Save map metadata to DM Toolkit
export const saveMap = async (mapData, token) => {
  const response = await axios.post(
    `${API_BASE}/dmtoolkit`,
    {
      toolkitType: "Map",
      content: mapData,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// 4. Delete a map
export const deleteMap = async (mapId, token) => {
  const response = await axios.delete(`${API_BASE}/dmtoolkit/${mapId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response;
};
export const updateMapTokens = async (mapId, placedTokens, token) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/dmtoolkit/${mapId}`,
      {
        "content.placedTokens": placedTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("Failed to update map tokens:", err);
    throw err;
  }
};

export const updateMap = async (mapId, updatedContent, token) => {
  const res = await axios.patch(
    `${import.meta.env.VITE_API_URL}/api/dmtoolkit/${mapId}`,
    { content: updatedContent },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
