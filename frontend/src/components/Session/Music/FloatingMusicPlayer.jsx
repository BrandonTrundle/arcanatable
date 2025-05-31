import React, { useState, useRef, useEffect } from "react";
import styles from "../../../styles/SessionStyles/Music/FloatingMusicPlayer.module.css";

const FloatingMusicPlayer = ({
  track,
  onNext,
  onPrev,
  onStop,
  volume,
  onVolumeChange,
  repeat,
  setRepeat,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const playerRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const el = playerRef.current;
      el.style.left = `${e.clientX - offset.current.x}px`;
      el.style.top = `${e.clientY - offset.current.y}px`;
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

  if (!track) return null;

  return (
    <div
      className={styles.player}
      ref={playerRef}
      style={{ top: "80px", left: "20px" }}
    >
      <div className={styles.header} onMouseDown={startDrag}>
        🎶 {collapsed ? "Now Playing" : track.title}
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "⏷" : "⏶"}
        </button>
      </div>

      {!collapsed && (
        <div className={styles.controls}>
          <div className={styles.buttons}>
            <button onClick={onPrev}>⏮️</button>
            <button onClick={onStop}>⏹️</button>
            <button onClick={onNext}>⏭️</button>
            <button onClick={() => setRepeat((r) => !r)}>
              🔁 {repeat ? "✅" : "❌"}
            </button>
          </div>
          <label className={styles.volume}>
            🔊
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default FloatingMusicPlayer;
