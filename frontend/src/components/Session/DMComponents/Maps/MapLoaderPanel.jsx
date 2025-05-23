import React, { useEffect, useState } from "react";
import "../../../../styles/SessionStyles/DMStyles/MapLoaderPanel.css";
import MapCreationForm from "./MapCreationForm";

const MapLoaderPanel = ({ campaign, socket, saveCurrentMap, onClose }) => {
  const [maps, setMaps] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dmtoolkit`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
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

  const handleLoadMap = async (map) => {
    try {
      if (typeof saveCurrentMap === "function") {
        await saveCurrentMap();
      }

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/sessionstate/${
          campaign._id
        }/set-map`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mapId: map._id }),
        }
      );

      const refreshed = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dmtoolkit/${map._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const latestMap = await refreshed.json();
      socket.emit("loadMap", latestMap);
    } catch (err) {
      console.error("❌ Failed to set current map:", err);
      alert("Failed to load map for session.");
    }
  };

  const handleMapSubmit = async ({ name, width, height, imageUrl }) => {
    const completeContent = {
      name,
      width,
      height,
      imageUrl,
      placedTokens: [],
      campaign: campaign._id,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dmtoolkit`, {
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

  const closeWithAnimation = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Match CSS transition duration
  };

  return (
    <div className={`map-loader-panel ${isVisible ? "fly-in" : "fly-out"}`}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>📂 Load a Map</h3>
        {onClose && (
          <button
            onClick={closeWithAnimation}
            style={{
              background: "none",
              border: "none",
              color: "#f0f0f0",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            ✖
          </button>
        )}
      </div>

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
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/api/uploads/maps`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
              }
            );

            if (!res.ok) {
              const text = await res.text();
              console.error("Upload failed:", text);
              throw new Error("Upload failed");
            }

            const { url } = await res.json();
            return url;
          }}
          campaignId={campaign._id}
        />
      )}
    </div>
  );
};

export default MapLoaderPanel;
