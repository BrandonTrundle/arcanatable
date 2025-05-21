import React, { useRef, useEffect, useState } from "react";
import "../../../styles/AoEControlPanel.css";

const SHAPES = ["cone", "circle", "square", "rectangle", "line"];

const AoEControlPanel = ({
  selectedShape,
  setSelectedShape,
  isAnchored,
  setIsAnchored,
}) => {
  const panelRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      panel.style.left = `${e.clientX - dragOffset.x}px`;
      panel.style.top = `${e.clientY - dragOffset.y}px`;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const startDrag = (e) => {
    const panel = panelRef.current;
    const rect = panel.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  return (
    <div className="aoe-control-panel" ref={panelRef}>
      <div className="aoe-control-header" onMouseDown={startDrag}>
        🎯 AoE Tool
      </div>

      <div className="aoe-shape-buttons">
        {SHAPES.map((shape) => (
          <button
            key={shape}
            onClick={() => setSelectedShape(shape)}
            className={selectedShape === shape ? "selected" : ""}
          >
            {shape.charAt(0).toUpperCase() + shape.slice(1)}
          </button>
        ))}
      </div>

      <div className="aoe-anchor-toggle">
        <input
          type="checkbox"
          checked={isAnchored}
          onChange={(e) => setIsAnchored(e.target.checked)}
        />
        <label>Anchor to token</label>
      </div>
    </div>
  );
};

export default AoEControlPanel;
