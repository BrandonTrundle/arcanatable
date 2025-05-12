// components/Session/Toolbar.js
import "../../../../styles/SessionStyles/DMStyles/DMView.css";
import React from "react";

const Toolbar = ({ setActiveTool, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="dm-toolbar">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "⏴" : "⏵"}
      </button>

      <div className="toolbar-buttons">
        <button onClick={() => setActiveTool("tokens")}>🎯 Tokens</button>
        <button onClick={() => setActiveTool("maps")}>🗺️ Maps</button>
        <button onClick={() => setActiveTool("fog")}>🌫️ Fog</button>
        <button onClick={() => setActiveTool("combat")}>⚔️ Combat</button>
        <button onClick={() => setActiveTool("dice")}>🎲 Dice</button>
        <button onClick={() => setActiveTool("files")}>📁 Files</button>
        <button onClick={() => setActiveTool("players")}>🧑‍🤝‍🧑 Players</button>
        <button onClick={() => setActiveTool("notes")}>📝 Notes</button>
      </div>
    </div>
  );
};

export default Toolbar;
