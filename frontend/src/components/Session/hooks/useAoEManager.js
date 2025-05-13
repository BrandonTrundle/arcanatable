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
    socket,
    campaignId
  );

  const handleMapClick = () => {
    console.log("🖱️ handleMapClick triggered");

    if (activeInteractionMode !== "aoe" || !aoeDraft) {
      console.log("⚠️ Ignored click: wrong mode or no draft");
      return;
    }

    const shape = confirmPlacement();
    console.log("📐 confirmPlacement returned:", shape);

    if (!shape) return;
    if (shape.rotating) {
      console.log("↪️ Still rotating, waiting for second click");
      return;
    }

    const finalShape = { ...shape, id: crypto.randomUUID() };
    console.log("🛰️ Emitting AoE:", finalShape);

    addAoEShape(finalShape);

    if (socket && socket.emit) {
      socket.emit("aoePlaced", {
        mapId,
        campaignId,
        aoe: finalShape,
      });
    }

    clearDraft();
    setShowAoEToolbox(false);
    setActiveInteractionMode("select");
  };

  const confirmAoE = ({ type, radius, color }) => {
    startAoE(type, radius, color);
    setShowAoEToolbox(false);
  };

  useEffect(() => {
    if (activeInteractionMode === "aoe") {
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

    const handleRemoteAoERemoval = ({ mapId: incomingMapId, aoeId }) => {
      if (incomingMapId !== mapId) return;
      console.log("🧹 Remote AoE removal received:", aoeId);
      removeAoEShape(aoeId, { silent: true });
    };

    socket.on("aoePlaced", handleRemoteAoE);
    socket.on("aoeRemoved", handleRemoteAoERemoval);

    return () => {
      socket.off("aoePlaced", handleRemoteAoE);
      socket.off("aoeRemoved", handleRemoteAoERemoval);
    };
  }, [socket, mapId, addAoEShape, removeAoEShape]);

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
