import React from "react";
import "../../../styles/SessionStyles/DMStyles/DMView.css"; // reuse existing DM styles

const Toolbar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="dm-toolbar">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "⏴" : "⏵"}
      </button>

      <div className="toolbar-buttons">
        <button>🎲 Dice</button>
        <button>📁 Files</button>
        <button>📝 Notes</button>
      </div>
    </div>
  );
};

export default Toolbar;
