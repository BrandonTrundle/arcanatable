import React, { useRef, useEffect, useState } from "react";
import "../../../styles/AoEControlPanel.css";

const SHAPES = ["cone", "circle", "square", "rectangle"];

const AoEControlPanel = ({
  selectedShape,
  setSelectedShape,
  isAnchored,
  setIsAnchored,
  shapeSettings,
  setShapeSettings,
  snapMode, // ✅ NEW
  setSnapMode,
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

  const handleShapeSettingChange = (field, value) => {
    setShapeSettings((prev) => ({
      ...prev,
      [selectedShape]: {
        ...prev[selectedShape],
        [field]: value,
      },
    }));
  };

  const renderShapeSettings = () => {
    const settings = shapeSettings[selectedShape] || {};

    switch (selectedShape) {
      case "cone":
        return (
          <div className="aoe-shape-config">
            <label>
              Radius (ft):
              <input
                type="number"
                min="5"
                step="5"
                value={settings.radius || 30}
                onChange={(e) =>
                  handleShapeSettingChange("radius", parseInt(e.target.value))
                }
              />
            </label>
            <label>
              Angle (°):
              <input
                type="number"
                min="1"
                max="360"
                value={settings.angle || 60}
                onChange={(e) =>
                  handleShapeSettingChange("angle", parseInt(e.target.value))
                }
              />
            </label>
            <label>
              Color:
              <input
                type="color"
                value={settings.color || "#ff0000"}
                onChange={(e) =>
                  handleShapeSettingChange("color", e.target.value)
                }
              />
            </label>
          </div>
        );

      case "circle":
        return (
          <div className="aoe-shape-config">
            <label>
              Radius (ft):
              <input
                type="number"
                min="5"
                step="5"
                value={settings.radius || 20}
                onChange={(e) =>
                  handleShapeSettingChange("radius", parseInt(e.target.value))
                }
              />
            </label>
            <label>
              Color:
              <input
                type="color"
                value={settings.color || "#ff0000"}
                onChange={(e) =>
                  handleShapeSettingChange("color", e.target.value)
                }
              />
            </label>
          </div>
        );

      case "square":
        return (
          <div className="aoe-shape-config">
            <label>
              Width (ft):
              <input
                type="number"
                min="5"
                step="5"
                value={settings.width || 30}
                onChange={(e) =>
                  handleShapeSettingChange("width", parseInt(e.target.value))
                }
              />
            </label>
            <label>
              Color:
              <input
                type="color"
                value={settings.color || "#ff0000"}
                onChange={(e) =>
                  handleShapeSettingChange("color", e.target.value)
                }
              />
            </label>
          </div>
        );
      case "rectangle":
        return (
          <div className="aoe-shape-config">
            <label>
              Width (ft):
              <input
                type="number"
                min="5"
                step="5"
                value={settings.width || 40}
                onChange={(e) =>
                  handleShapeSettingChange("width", parseInt(e.target.value))
                }
              />
            </label>
            <label>
              Height (ft):
              <input
                type="number"
                min="5"
                step="5"
                value={settings.height || 20}
                onChange={(e) =>
                  handleShapeSettingChange("height", parseInt(e.target.value))
                }
              />
            </label>
            <label>
              Color:
              <input
                type="color"
                value={settings.color || "#ff0000"}
                onChange={(e) =>
                  handleShapeSettingChange("color", e.target.value)
                }
              />
            </label>
          </div>
        );

      default:
        return null;
    }
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
      <div className="aoe-snap-mode-toggle">
        <label>Snap Mode:</label>
        <select value={snapMode} onChange={(e) => setSnapMode(e.target.value)}>
          <option value="center">Center</option>
          <option value="corner">Corner</option>
        </select>
      </div>

      {renderShapeSettings()}
    </div>
  );
};

export default AoEControlPanel;
