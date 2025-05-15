import React, { useState, useEffect, useMemo } from "react";
import "../../../styles/MapsManager.css";
import {
  uploadMapImage,
  saveMap,
  updateMap,
} from "../../../services/mapService";
import { useUserContext } from "../../../context/UserContext";
import axios from "axios";
import MapEditor from "../Maps/MapEditor";
import MapCreationForm from "./MapCreationForm";
import MapListItem from "./MapListItem";

const MapsManager = () => {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const { user } = useUserContext();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dmtoolkit`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        const mapItems = res.data.filter((item) => item.toolkitType === "Map");
        setMaps(mapItems);
      } catch (err) {
        console.error("Failed to load maps:", err);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/campaigns`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        const ownedCampaigns = res.data.filter((c) => c.creator === user._id);
        setCampaigns(ownedCampaigns);
      } catch (err) {
        console.error("Failed to load campaigns:", err);
      }
    };

    if (user?.token) {
      fetchMaps();
      fetchCampaigns(); // <-- add this
    }
  }, [user]);

  const handleMapSubmit = async ({ name, width, height, imageUrl }) => {
    try {
      const savedMap = await saveMap(
        {
          name,
          width,
          height,
          imageUrl,
          placedTokens: [],
          campaign: selectedCampaignId, // ✅ Add campaign._id to map content
        },
        user.token
      );
      setMaps((prev) => [...prev, savedMap]);
    } catch (err) {
      console.error("Failed to save map", err);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      return await uploadMapImage(file);
    } catch (err) {
      console.error("Image upload failed", err);
      return "";
    }
  };

  const handleMapUpdateInline = async (updatedMap) => {
    //   console.log("handleMapUpdateInline →", updatedMap); // 👈 Add this
    try {
      const saved = await updateMap(
        updatedMap._id,
        updatedMap.content,
        user.token
      );
      //     console.log("Map saved on server →", saved); // 👈 Add this too
      setMaps((prev) => prev.map((m) => (m._id === saved._id ? saved : m)));
    } catch (err) {
      console.error("Failed to update map:", err);
      alert("Could not save map changes.");
    }
  };

  const handleDeleteMap = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/dmtoolkit/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setMaps((prev) => prev.filter((map) => map._id !== id));
      if (selectedMap?._id === id) setSelectedMap(null);
    } catch (err) {
      console.error("Failed to delete map:", err);
      alert("Could not delete the map.");
    }
  };

  const renderedMapEditor = useMemo(() => {
    if (!selectedMap) return null;

    return (
      <MapEditor
        map={selectedMap}
        onClose={() => setSelectedMap(null)}
        onMapUpdate={(updatedMap) => {
          setMaps((prev) =>
            prev.map((m) => (m._id === updatedMap._id ? updatedMap : m))
          );
          setSelectedMap(updatedMap);
        }}
      />
    );
  }, [selectedMap]);

  return (
    <div className="maps-manager">
      <h2>🗺️ Map Manager</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>Select Campaign: </label>
        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
        >
          <option value="">-- Choose Campaign --</option>
          {campaigns.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <MapCreationForm
        onSubmit={handleMapSubmit}
        onImageUpload={handleImageUpload}
      />

      <div className="saved-maps">
        <h3>Saved Maps</h3>
        {maps.length === 0 ? (
          <p>No maps added yet.</p>
        ) : (
          <ul>
            {maps.map((map) => (
              <MapListItem
                key={map._id}
                map={map}
                isSelected={selectedMap?._id === map._id}
                onSelect={setSelectedMap}
                onUpdate={handleMapUpdateInline}
                onDelete={handleDeleteMap}
                campaigns={campaigns}
              />
            ))}
          </ul>
        )}
      </div>

      {renderedMapEditor}
    </div>
  );
};

export default MapsManager;
