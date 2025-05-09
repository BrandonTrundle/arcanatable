import React, { useEffect, useState } from "react";
import "../../../../styles/SessionStyles/DMStyles/MapLoaderPanel.css";
import MapCreationForm from "./MapCreationForm";

const MapLoaderPanel = ({ campaign, socket }) => {
  const [maps, setMaps] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const res = await fetch("/api/dmtoolkit", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        const filtered = data.filter(
          (item) =>
            item.toolkitType === "Map" && item.content.campaign === campaign._id
        );
        setMaps(filtered);
      } catch (err) {
        console.error("Failed to fetch maps for session:", err);
      }
    };

    fetchMaps();
  }, [campaign]);

  const handleLoadMap = (map) => {
    console.log("📤 Emitting map to socket:", map);
    socket.emit("loadMap", map); // we’ll wire up reception later
  };
  const handleMapSubmit = async ({ name, width, height, imageUrl }) => {
    const completeContent = {
      name,
      width,
      height,
      imageUrl,
      placedTokens: [],
      campaign: campaign._id, // ✅ store campaign._id, not name
    };

    try {
      const res = await fetch("/api/dmtoolkit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolkitType: "Map",
          content: completeContent,
        }),
      });

      const newMap = await res.json();
      setMaps((prev) => [...prev, newMap]);
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create map:", err);
      alert("Could not create map.");
    }
  };

  return (
    <div className="map-loader-panel">
      <h3>📂 Load a Map</h3>
      <ul className="map-list">
        {maps.map((map) => (
          <li key={map._id}>
            <strong>{map.content.name}</strong>
            <button onClick={() => handleLoadMap(map)}>📤 Load</button>
          </li>
        ))}
      </ul>

      <hr />

      <button onClick={() => setShowCreate(!showCreate)}>
        {showCreate ? "✖ Cancel" : "➕ Create New Map"}
      </button>

      {showCreate && (
        <MapCreationForm
          onSubmit={handleMapSubmit}
          onImageUpload={async (file) => {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: file,
            });
            const data = await res.json();
            return data.url;
          }}
        />
      )}
    </div>
  );
};

export default MapLoaderPanel;
