import React from "react";
import SessionContextMenu from "../Tokens/SessionContextMenu";
import AoEToolbox from "../UI/AoEToolbox";

const MapUIOverlays = ({
  isDM,
  contextMenu,
  handleTokenAction,
  closeContextMenu,
  showAoEToolbox,
  confirmAoE,
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

      {showAoEToolbox && <AoEToolbox onConfirm={confirmAoE} />}
    </>
  );
};

export default MapUIOverlays;
