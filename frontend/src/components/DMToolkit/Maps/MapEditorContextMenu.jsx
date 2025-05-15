import React, { useState } from "react";
import "../../../styles/MapEditor.css";

const MapEditorContextMenu = ({ contextMenu, onAction, onClose }) => {
  const [selectedSize, setSelectedSize] = useState("");

  React.useEffect(() => {
    if (contextMenu?.mode === "resize") {
      const currentSize = contextMenu?.currentSize ?? "";
      setSelectedSize(currentSize);
    }
  }, [contextMenu]);

  if (!contextMenu) return null;

  const { x, y, tokenId, mode } = contextMenu;

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
            setSelectedSize(value);
            if (value && tokenId) {
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
          <div
            onClick={() => {
              onAction("to-dm", tokenId);
              onClose();
            }}
          >
            🧙 To DM Layer
          </div>
          <div
            onClick={() => {
              onAction("to-player", tokenId);
              onClose();
            }}
          >
            🧍 To Player Layer
          </div>
          <div
            onClick={() => {
              onAction("number", tokenId);
              onClose();
            }}
          >
            🔢 Token Number
          </div>
          <div
            onClick={() => {
              onAction("resize", tokenId);
              // Do NOT call onClose(); we want the menu to stay open and transition to resize mode
            }}
          >
            📏 Edit Size
          </div>
          <div
            onClick={() => {
              onAction("delete", tokenId);
              onClose();
            }}
          >
            🗑 Delete Token
          </div>
        </>
      )}
    </div>
  );
};

export default MapEditorContextMenu;
