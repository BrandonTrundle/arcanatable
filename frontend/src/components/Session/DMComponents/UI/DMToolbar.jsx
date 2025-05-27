import "../../../../styles/SessionStyles/DMStyles/DMView.css";
import React from "react";

const DMToolbar = ({
  activeTool,
  setActiveTool,
  sidebarOpen,
  setSidebarOpen,
  setShowDiceRoller,
}) => {
  const handleToolClick = (tool) => {
    if (tool === "dice") {
      setShowDiceRoller((prev) => !prev);
    } else {
      setActiveTool((prevTool) => (prevTool === tool ? null : tool));
    }
  };

  return (
    <div className="dm-toolbar">
      <div className="toolbar-buttons">
        <button onClick={() => handleToolClick("tokens")}>🎯 Tokens</button>
        <button onClick={() => handleToolClick("maps")}>🗺️ Maps</button>
        <button onClick={() => handleToolClick("npcs")}>📝 NPCs</button>
        <button onClick={() => handleToolClick("creatures")}>
          📝 Creatures
        </button>
        <button onClick={() => handleToolClick("fog")}>🌫️ Fog</button>
        <button onClick={() => handleToolClick("combat")}>⚔️ Combat</button>
        <button onClick={() => handleToolClick("dice")}>🎲 Dice</button>
        <button onClick={() => handleToolClick("files")}>📁 Files</button>
        <button onClick={() => handleToolClick("players")}>🧑‍🤝‍🧑 PC's</button>
        <button onClick={() => handleToolClick("notes")}>📝 Notes</button>
      </div>
    </div>
  );
};

export default DMToolbar;
