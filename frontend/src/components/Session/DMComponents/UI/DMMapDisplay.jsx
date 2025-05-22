import { useEffect } from "react";
import RefactoredMap from "../Maps/RefactoredMap";
import loadMapFallback from "../../../../assets/LoadMapToProceed.png";
import { useAOEManager } from "../../AoE/hooks/useAoEManager";

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
  isCombatMode,
  setFocusedToken,
  useRolledHP,
  showTokenInfo,
  combatState,
  campaignId,
}) => {
  const { aoes, addAOE, updateAOE, removeAOE, setAoes } = useAOEManager(
    [],
    socket,
    campaignId,
    activeMap?._id
  );

  useEffect(() => {
    if (activeMap?._id) {
      setAoes([]);
      console.log("[AOE] Cleared AoEs on map switch:", activeMap._id);
    }
  }, [activeMap?._id]);

  useEffect(() => {
    if (socket && campaignId && activeMap?._id) {
      socket.emit("aoe:load", { campaignId, mapId: activeMap._id });

      socket.on("aoe:load", (loadedAoEs) => {
        setAoes(loadedAoEs);
        console.log("[AOE] Loaded persisted AoEs:", loadedAoEs);
      });

      return () => {
        socket.off("aoe:load");
      };
    }
  }, [socket, campaignId, activeMap?._id]);

  if (activeMap && activeMap.content) {
    return (
      <RefactoredMap
        map={activeMap}
        aoes={aoes}
        addAOE={addAOE}
        removeAOE={removeAOE}
        updateAOE={updateAOE}
        activeLayer={activeLayer}
        isDM={true}
        socket={socket}
        user={user}
        selectedTokenId={selectedTokenId}
        setSelectedTokenId={setSelectedTokenId}
        activeInteractionMode={activeInteractionMode}
        setActiveInteractionMode={setActiveInteractionMode}
        setExternalTokens={setExternalTokens}
        isCombatMode={isCombatMode}
        setFocusedToken={setFocusedToken}
        useRolledHP={useRolledHP}
        showTokenInfo={showTokenInfo}
        combatState={combatState}
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
