import React, { useState, useEffect } from "react";

const AoEToolbox = ({ onConfirm }) => {
  const [type, setType] = useState("circle");
  const [size, setSize] = useState(20); // in ft
  const [color, setColor] = useState("rgba(255,0,0,0.4)");
  const [rawHex, setRawHex] = useState("#ff0000"); // original color input

  useEffect(() => {
    console.log("🎯 AoEToolbox initialized");
  }, []);

  const handleConfirm = () => {
    console.log("📤 AoE Config Confirmed:", {
      type,
      radiusFt: size,
      color,
    });
    onConfirm({ type, radius: size, color });
  };

  return (
    <div
      className="aoe-toolbox"
      style={{
        position: "fixed",
        top: "120px",
        right: "40px",
        backgroundColor: "white",
        padding: "1rem",
        border: "2px solid black",
        borderRadius: "10px",
        zIndex: 10000,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        minWidth: "240px",
        fontFamily: "sans-serif",
      }}
    >
      <h4 style={{ marginTop: 0 }}>🎯 AoE Settings</h4>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          <strong>Type:</strong>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              console.log("🔄 AoE Type changed to:", e.target.value);
            }}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="circle">Circle</option>
            <option value="cone">Cone</option>
            <option value="line">Line</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          <strong>Size (ft):</strong>
          <input
            type="number"
            value={size}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSize(val);
              console.log("📏 AoE Size changed to:", val, "ft");
            }}
            min={5}
            step={5}
            style={{ marginLeft: "0.5rem", width: "60px" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          <strong>Color:</strong>
          <input
            type="color"
            value={rawHex}
            onChange={(e) => {
              const hex = e.target.value;
              const rgba = hex + "66"; // transparency
              setRawHex(hex);
              setColor(rgba);
              console.log("🎨 AoE Color selected:", rgba);
            }}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <button
        onClick={handleConfirm}
        style={{
          marginTop: "0.5rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ✅ Confirm
      </button>
    </div>
  );
};

export default AoEToolbox;
