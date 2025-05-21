import React from "react";
import SessionContextMenu from "../Tokens/SessionContextMenu";

const MapUIOverlays = ({
  isDM,
  contextMenu,
  handleTokenAction,
  closeContextMenu,
}) => {
  return (
    <>
      {isDM && contextMenu && (
        <SessionContextMenu
          contextMenu={contextMenu}
          onAction={handleTokenAction}
          onClose={closeContextMenu}
        />
      )}
    </>
  );
};

export default MapUIOverlays;
