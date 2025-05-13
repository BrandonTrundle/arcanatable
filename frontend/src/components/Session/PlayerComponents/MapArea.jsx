import React from "react";
import RefactoredMap from "../DMComponents/Maps/RefactoredMap";
import InteractionToolbar from "../DMComponents/UI/InteractionToolbar";
import loadMapFallback from "../../../assets/LoadMapToProceed.png";

const MapArea = ({
  activeMap,
  socket,
  user,
  activeInteractionMode,
  setActiveInteractionMode,
  selectedTokenId,
  setSelectedTokenId,
}) => {
  return (
    <main className="dm-map-area">
      {activeMap && activeMap.content ? (
        <RefactoredMap
          map={activeMap}
          activeLayer="player"
          isDM={false}
          socket={socket}
          user={user}
          activeInteractionMode={activeInteractionMode}
          setActiveInteractionMode={setActiveInteractionMode}
          selectedTokenId={selectedTokenId}
          setSelectedTokenId={setSelectedTokenId}
        />
      ) : (
        <div className="map-placeholder">
          <img
            src={loadMapFallback}
            alt="No map loaded"
            style={{ width: "60%", opacity: 0.5 }}
          />
          <p style={{ color: "#ccc" }}>Waiting for DM to load a map...</p>
        </div>
      )}

      {selectedTokenId && (
        <InteractionToolbar
          activeMode={activeInteractionMode}
          setActiveMode={setActiveInteractionMode}
        />
      )}
    </main>
  );
};

export default MapArea;
