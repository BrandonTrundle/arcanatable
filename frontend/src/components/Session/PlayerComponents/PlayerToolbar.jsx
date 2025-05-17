import React from "react";
import "../../../styles/SessionStyles/DMStyles/DMView.css"; // reuse existing DM styles

const Toolbar = ({ sidebarOpen, setSidebarOpen, setActiveTool }) => {
  const handleToolClick = (tool) => {
    //   console.log(`🛠️ Toolbar: Setting active tool -> ${tool}`);
    setActiveTool(tool);
  };

  return (
    <div className="dm-toolbar">
      <button
        className="sidebar-toggle"
        onClick={() => {
          //    console.log(
          //</div>     `📂 Sidebar toggled: ${!sidebarOpen ? "open" : "closed"}`
          //    );
          setSidebarOpen(!sidebarOpen);
        }}
      >
        {sidebarOpen ? "⏴" : "⏵"}
      </button>

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
