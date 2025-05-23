import React from "react";
import "../../../styles/SessionStyles/DMStyles/DMView.css"; // reuse existing DM styles

const Toolbar = ({
  sidebarOpen,
  setSidebarOpen,
  setActiveTool,
  setShowDiceRoller,
}) => {
  const handleToolClick = (tool) => {
    if (tool === "dice") {
      setShowDiceRoller((prev) => !prev);
    } else {
      setActiveTool(tool);
    }
  };

  return (
    <div className="dm-toolbar">
      <div className="toolbar-buttons">
        <button onClick={() => handleToolClick("dice")}>🎲 Dice</button>
        <button onClick={() => setActiveTool("character-sheet")}>
          🧙 Character Sheet
        </button>

        <button onClick={() => handleToolClick("files")}>📁 Files</button>
        <button onClick={() => handleToolClick("notes")}>📝 Notes</button>
        <button
          onClick={() => {
            console.log("🎯 Tokens toggled");
            setActiveTool("tokens");
          }}
        >
          🎯 Tokens
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
