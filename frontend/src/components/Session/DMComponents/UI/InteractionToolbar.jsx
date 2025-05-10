import React from "react";
import "../../../../styles/SessionStyles/DMStyles/InteractionToolbar.css";

const InteractionToolbar = ({ activeMode, setActiveMode, className }) => {
  const tools = [
    { mode: "select", label: "🖱️", title: "Select Tool" },
    { mode: "measure", label: "📏", title: "Measure" },
    { mode: "hp", label: "🧪", title: "Edit HP" },
    { mode: "combat", label: "⚔️", title: "Combat Mode" },
  ];

  return (
    <div className={`interaction-toolbar ${className || ""}`}>
      {tools.map((tool) => (
        <button
          key={tool.mode}
          className={`toolbar-button ${
            activeMode === tool.mode ? "active" : ""
          }`}
          title={tool.title}
          onClick={() => setActiveMode(tool.mode)}
        >
          <span className="emoji">{tool.label}</span>
        </button>
      ))}
    </div>
  );
};

export default InteractionToolbar;
