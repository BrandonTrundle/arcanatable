import React, { useRef, useEffect, useState } from "react";
import styles from "../../../styles/SessionStyles/Music/MusicPanel.module.css";

const PlayerMusicPanel = ({ currentTrack, volume, setVolume }) => {
  const playerRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const [collapsed, setCollapsed] = useState(false);

  // Drag logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current || !playerRef.current) return;
      playerRef.current.style.left = `${e.clientX - offset.current.x}px`;
      playerRef.current.style.top = `${e.clientY - offset.current.y}px`;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startDrag = (e) => {
    const rect = playerRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    isDragging.current = true;
  };

  if (!currentTrack) return null;

  return (
    <div
      ref={playerRef}
      style={{
        position: "fixed",
        top: "80px",
        left: "20px",
        background: "#1e1e1e",
        padding: "12px 16px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        color: "white",
        width: "300px",
      }}
    >
      {/* Header Bar */}
      <div
        onMouseDown={startDrag}
        style={{
          cursor: "move",
          fontWeight: "bold",
          marginBottom: collapsed ? 0 : "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        🎵 Now Playing
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          style={{
            marginLeft: "8px",
            background: "none",
            border: "none",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          {collapsed ? "⏷" : "⏶"}
        </button>
      </div>

      {/* Collapsible Body */}
      {!collapsed && (
        <div>
          <div style={{ marginBottom: "8px" }}>
            <strong>Track:</strong> {currentTrack.title}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <label style={{ marginLeft: "auto" }}>
              🔊
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{
                  verticalAlign: "middle",
                  marginLeft: "0.5rem",
                  cursor: "pointer",
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(PlayerMusicPanel);
