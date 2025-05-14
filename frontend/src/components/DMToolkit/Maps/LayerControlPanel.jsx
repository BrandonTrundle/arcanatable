import React, { useRef, useState, useEffect } from "react";
import "../../../styles/LayerControlPanel.css";
import TokenList from "../TokenList";

const LayerControlPanel = ({ activeLayer, onLayerChange }) => {
  const panelRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging || !panelRef.current) return;

      requestAnimationFrame(() => {
        const newX = e.clientX - offsetRef.current.x;
        const newY = e.clientY - offsetRef.current.y;

        const maxX = window.innerWidth - panelRef.current.offsetWidth;
        const maxY = window.innerHeight - panelRef.current.offsetHeight;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      });
    };

    const handleMouseUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const handleMouseDown = (e) => {
    const rect = panelRef.current.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  };

  return (
    <div
      className="layer-control-panel"
      ref={panelRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className="drag-handle"
        onMouseDown={handleMouseDown}
        style={{ cursor: "grab", userSelect: "none", marginBottom: "0.5rem" }}
      >
        <h4>🧭 Layer Controls</h4>
      </div>
      <div className="layer-buttons">
        {["dm", "player", "event"].map((layer) => (
          <button
            key={layer}
            className={activeLayer === layer ? "active" : ""}
            onClick={() => onLayerChange(layer)}
          >
            {layer.charAt(0).toUpperCase() + layer.slice(1)} Layer
          </button>
        ))}
      </div>

      <div className="token-section">
        <h5>🎭 Tokens</h5>
        <TokenList user={{ token: localStorage.getItem("token") }} />
      </div>
    </div>
  );
};

export default LayerControlPanel;
