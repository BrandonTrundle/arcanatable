import React, { useState, useRef } from "react";
import Draggable from "react-draggable";
import "../../../../styles/TokenInfoPanel.css"; // optional, style manually if not ready

const TokenInfoPanel = ({ token, onClose, onHPChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const nodeRef = useRef(null);

  if (!token) return null;
  //console.log("🧠 Rendering TokenInfoPanel for:", token.name);

  return (
    <Draggable handle=".panel-header" nodeRef={nodeRef}>
      <div
        ref={nodeRef}
        className="token-info-panel"
        style={{
          position: "fixed",
          top: "100px",
          left: "300px",
          zIndex: 9999,
          background: "white",
          border: "1px solid #444",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          padding: "1rem",
          minWidth: "260px",
        }}
      >
        <div
          className="panel-header"
          style={{ cursor: "move", marginBottom: "0.5rem" }}
        >
          <strong>{token.name}</strong>
          <div style={{ float: "right" }}>
            <button onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? "🔽" : "🔼"}
            </button>
            <button onClick={onClose} style={{ marginLeft: "0.25rem" }}>
              ✖
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="panel-body">
            <p>
              <strong>HP:</strong> {token.currentHP ?? "—"} /{" "}
              {token.maxHP ?? "—"}
            </p>

            <p>
              <strong>Conditions:</strong>{" "}
              {token.conditions?.join(", ") || "None"}
            </p>
            <p>
              <strong>Notes:</strong>
            </p>
            <p
              style={{
                background: "#eee",
                padding: "0.5rem",
                borderRadius: "4px",
                minHeight: "40px",
                whiteSpace: "pre-wrap",
              }}
            >
              {token.notes || "(none)"}
            </p>
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default TokenInfoPanel;
