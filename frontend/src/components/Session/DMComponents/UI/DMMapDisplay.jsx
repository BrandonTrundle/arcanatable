import React from "react";
import RefactoredMap from "../Maps/RefactoredMap";
import loadMapFallback from "../../../../assets/LoadMapToProceed.png";

const DMMapDisplay = ({
  activeMap,
  user,
  socket,
  activeLayer,
  selectedTokenId,
  setSelectedTokenId,
  activeInteractionMode,
  setActiveInteractionMode,
  setExternalTokens,
}) => {
  if (activeMap && activeMap.content) {
    return (
      <RefactoredMap
        map={activeMap}
        activeLayer={activeLayer}
        isDM={true}
        socket={socket}
        user={user}
        selectedTokenId={selectedTokenId}
        setSelectedTokenId={setSelectedTokenId}
        activeInteractionMode={activeInteractionMode}
        setActiveInteractionMode={setActiveInteractionMode}
        setExternalTokens={setExternalTokens}
      />
    );
  }

  return (
    <div className="map-placeholder">
      <img
        src={loadMapFallback}
        alt="No map loaded"
        style={{ width: "60%", opacity: 0.8 }}
      />
      <p style={{ color: "#ccc" }}>No map loaded yet.</p>
    </div>
  );
};

export default DMMapDisplay;
