import React, { useState, useRef } from "react";
import Draggable from "react-draggable";
import styles from "../../../styles/MeasurementPanel.module.css";

const MeasurementPanel = ({
  broadcastEnabled,
  setBroadcastEnabled,
  measurementColor,
  setMeasurementColor,
  snapSetting,
  setSnapSetting,
  lockMeasurement,
  setLockMeasurement,
  lockedMeasurements,
  setLockedMeasurements,
  isDM,
  mapId,
  userId,
  socket,
  onClose,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const nodeRef = useRef(null);

  const clearMyMeasurements = () => {
    socket.emit("measurement:clearLocked", { mapId, userId });
    setLockedMeasurements((prev) => prev.filter((m) => m.userId !== userId));
  };

  const clearAllMeasurements = () => {
    socket.emit("measurement:clearAll", { mapId });
  };

  return (
    <Draggable handle={`.${styles.header}`} nodeRef={nodeRef}>
      <div ref={nodeRef} className={styles.panel}>
        <div className={styles.header}>
          <span>📏 Measurement Tool</span>
          <div className={styles.controls}>
            <button onClick={() => setCollapsed((prev) => !prev)}>
              {collapsed ? "🔽" : "🔼"}
            </button>
            <button onClick={onClose}>✖</button>
          </div>
        </div>

        {!collapsed && (
          <div className={styles.body}>
            {lockedMeasurements.length > 0 && (
              <button className={styles.button} onClick={clearMyMeasurements}>
                Clear My Measurements
              </button>
            )}

            {isDM && (
              <button
                className={`${styles.button} ${styles.clearAll}`}
                onClick={clearAllMeasurements}
              >
                Clear All Measurements
              </button>
            )}

            <label className={styles.label}>
              <input
                type="checkbox"
                checked={broadcastEnabled}
                onChange={(e) => setBroadcastEnabled(e.target.checked)}
              />
              Broadcast to Room
            </label>

            <label className={styles.label}>
              Color:
              <input
                type="color"
                value={measurementColor}
                onChange={(e) => setMeasurementColor(e.target.value)}
              />
            </label>

            <label className={styles.label}>
              Snap:
              <select
                value={snapSetting}
                onChange={(e) => setSnapSetting(e.target.value)}
              >
                <option value="center">Center</option>
                <option value="corner">Corner</option>
                <option value="none">None</option>
              </select>
            </label>

            <label className={styles.label}>
              <input
                type="checkbox"
                checked={lockMeasurement}
                onChange={(e) => setLockMeasurement(e.target.checked)}
              />
              Lock Measurement
            </label>
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default MeasurementPanel;
