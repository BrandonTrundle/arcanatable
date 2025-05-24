import React, { useEffect } from "react";
import RefactoredMap from "../DMComponents/Maps/RefactoredMap";
import InteractionToolbar from "../DMComponents/UI/InteractionToolbar";
import loadMapFallback from "../../../assets/LoadMapToProceed.png";
import { useTokenManager } from "../hooks/useTokenManager";
import { useDropHandler } from "../hooks/useDropHandler";
import { useAOEManager } from "../AoE/hooks/useAoEManager";

const MapArea = ({
  activeMap,
  socket,
  user,
  activeInteractionMode,
  setActiveInteractionMode,
  selectedTokenId,
  setSelectedTokenId,
  showTokenInfo,
  campaignId,
}) => {
  const {
    tokens,
    setTokens,
    handleDrop,
    handleTokenRightClick,
    handleTokenAction,
    emitTokenUpdate,
    hasControl,
    contextMenu,
    setContextMenu,
    externalSelections,
  } = useTokenManager({
    map: activeMap,
    socket,
    isDM: false,
    user,
  });

  useEffect(() => {
    // Clear AoEs on map change
    if (activeMap?._id) {
      setAoes([]);
      //     console.log("[AOE] Cleared AoEs due to map change:", activeMap._id);
    }
  }, [activeMap?._id]);

  const { aoes, addAOE, updateAOE, removeAOE, setAoes } = useAOEManager(
    [],
    socket,
    campaignId,
    activeMap?._id
  );

  useEffect(() => {
    if (socket && campaignId && activeMap?._id) {
      socket.emit("aoe:load", { campaignId, mapId: activeMap._id });

      socket.on("aoe:load", (loadedAoEs) => {
        setAoes(loadedAoEs);
        //      console.log("[AOE] Loaded persisted AoEs:", loadedAoEs);
      });

      return () => {
        socket.off("aoe:load");
      };
    }
  }, [socket, campaignId, activeMap?._id]);

  const { onDrop, onDragOver } = useDropHandler(handleDrop);

  return (
    <main className="dm-map-area" onDrop={onDrop} onDragOver={onDragOver}>
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
          setExternalTokens={setTokens}
          isCombatMode={false}
          setFocusedToken={() => {}}
          useRolledHP={false}
          showTokenInfo={showTokenInfo}
          aoes={aoes}
          addAOE={addAOE}
          removeAOE={removeAOE}
          updateAOE={updateAOE}
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
