import React from "react";

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
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "725px",
        right: "300px",
        backgroundColor: "#1e1e1e",
        padding: "16px",
        borderRadius: "10px",
        color: "#fff",
        zIndex: 9999,
        boxShadow: "0 0 10px rgba(0,0,0,0.6)",
        width: "240px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{ marginBottom: "10px", fontWeight: "bold", fontSize: "16px" }}
      >
        🧽 Measurement Tool
      </div>

      {lockedMeasurements.length > 0 && (
        <button
          style={{ marginTop: "8px" }}
          onClick={() => {
            socket.emit("measurement:clearLocked", {
              mapId,
              userId,
            });
            setLockedMeasurements((prev) =>
              prev.filter((m) => m.userId !== userId)
            );
          }}
        >
          Clear My Measurements
        </button>
      )}

      {isDM && (
        <button
          style={{ marginTop: "8px", backgroundColor: "#a33", color: "#fff" }}
          onClick={() => socket.emit("measurement:clearAll", { mapId })}
        >
          Clear All Measurements
        </button>
      )}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <input
          type="checkbox"
          checked={broadcastEnabled}
          onChange={(e) => setBroadcastEnabled(e.target.checked)}
        />
        Broadcast to Room
      </label>

      <label style={{ display: "block", marginBottom: "8px" }}>
        Color:
        <input
          type="color"
          value={measurementColor}
          onChange={(e) => setMeasurementColor(e.target.value)}
          style={{ marginLeft: "8px" }}
        />
      </label>

      <label style={{ display: "block", marginBottom: "8px" }}>
        Snap:
        <select
          value={snapSetting}
          onChange={(e) => setSnapSetting(e.target.value)}
          style={{ marginLeft: "8px" }}
        >
          <option value="center">Center</option>
          <option value="corner">Corner</option>
          <option value="none">None</option>
        </select>
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          checked={lockMeasurement}
          onChange={(e) => setLockMeasurement(e.target.checked)}
        />
        Lock Measurement
      </label>
    </div>
  );
};

export default MeasurementPanel;
