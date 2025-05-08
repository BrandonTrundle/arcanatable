import React, { useState } from "react";
import "../../../styles/MapEditor.css";

const MapEditorContextMenu = ({ contextMenu, onAction, onClose }) => {
  const [selectedSize, setSelectedSize] = useState("");

  React.useEffect(() => {
    if (contextMenu?.mode === "resize") {
      // Grab the current token’s size and default to it
      const currentSize = contextMenu?.currentSize ?? "";
      setSelectedSize(currentSize);
    }
  }, [contextMenu]);

  if (!contextMenu) return null;

  const { x, y, tokenId, mode } = contextMenu;
  console.log("Rendering context menu with mode:", mode);

  return (
    <div
      className="token-context-menu"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: `${y}px`,
        left: `${x}px`,
        zIndex: 1000,
        backgroundColor: "#fff",
        border: "1px solid #000",
        padding: "6px",
      }}
    >
      {mode === "resize" ? (
        <select
          autoFocus
          value={selectedSize}
          onChange={(e) => {
            const value = e.target.value;
            console.log("Dropdown value selected:", value); // 🐞 Debug log
            setSelectedSize(value);
            if (value && tokenId) {
              console.log("Resize dropdown changed →", tokenId, value);
              onAction("apply-resize", tokenId, value);
              onClose();
            }
          }}
        >
          <option value="" disabled>
            Select new size
          </option>
          {["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"].map(
            (size) => (
              <option key={size} value={size}>
                {size}
              </option>
            )
          )}
        </select>
      ) : (
        <>
          <div onClick={() => onAction("to-dm", tokenId)}>🧙 To DM Layer</div>
          <div onClick={() => onAction("to-player", tokenId)}>
            🧍 To Player Layer
          </div>
          <div onClick={() => onAction("number", tokenId)}>🔢 Token Number</div>
          <div onClick={() => onAction("resize", tokenId)}>📏 Edit Size</div>
          <div onClick={() => onAction("delete", tokenId)}>🗑 Delete Token</div>
        </>
      )}
    </div>
  );
};

export default MapEditorContextMenu;
