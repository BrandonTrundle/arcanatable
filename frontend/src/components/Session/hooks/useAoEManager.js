import { useEffect, useState } from "react";
import { useAoEDraft } from "./useAoEDraft";
import { useAoEShapes } from "./useAoEShapes";

export const useAoEManager = (
  activeInteractionMode,
  cellSize,
  setActiveInteractionMode,
  socket,
  mapId,
  campaignId,
  stageRef
) => {
  console.log("🧪 AoE Manager socket:", socket); // ← Add here
  const [showAoEToolbox, setShowAoEToolbox] = useState(false);

  const {
    aoeDraft,
    mousePosition,
    handleMouseMove,
    startAoE,
    confirmPlacement,
    clearDraft,
  } = useAoEDraft(cellSize);

  const { aoeShapes, addAoEShape, removeAoEShape } = useAoEShapes(
    mapId,
    socket
  );

  const handleMapClick = () => {
    if (activeInteractionMode !== "aoe" || !aoeDraft) return;

    const shape = confirmPlacement();
    if (!shape) return;

    addAoEShape(shape);

    // ✅ Emit to other users
    if (socket && socket.emit) {
      socket.emit("aoePlaced", {
        mapId,
        aoe: shape,
      });
    }

    clearDraft();
    setShowAoEToolbox(false);
    setActiveInteractionMode("select");
  };

  const confirmAoE = ({ type, radius, color }) => {
    startAoE(type, radius, color); // Now this is the *first and only* time it's called
    setShowAoEToolbox(false); // Close the settings window once done
  };

  useEffect(() => {
    if (activeInteractionMode === "aoe") {
      // Remove this:
      // startAoE("circle", 20, "rgba(255,0,0,0.4)");
      setShowAoEToolbox(true);
    } else {
      clearDraft();
      setShowAoEToolbox(false);
    }
  }, [activeInteractionMode]);

  useEffect(() => {
    if (!socket) return;

    const handleRemoteAoE = ({ mapId: incomingMapId, aoe }) => {
      if (incomingMapId !== mapId) return;
      addAoEShape(aoe);
    };

    socket.on("aoePlaced", handleRemoteAoE);

    return () => {
      socket.off("aoePlaced", handleRemoteAoE);
    };
  }, [socket, mapId, addAoEShape]);

  return {
    aoeDraft,
    mousePosition,
    aoeShapes,
    showAoEToolbox,
    handleMouseMove: (e) => handleMouseMove(e, stageRef),
    handleMapClick,
    confirmAoE,
    removeAoE: removeAoEShape,
  };
};
