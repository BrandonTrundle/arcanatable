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

  const handleMapClick = (pos) => {
    if (activeInteractionMode !== "aoe" || !aoeDraft) {
      console.warn("⚠️ handleMapClick ignored — wrong mode or no draft", {
        activeInteractionMode,
        hasDraft: !!aoeDraft,
      });
      return;
    }

    let trueX, trueY;

    if (pos?.trueX != null && pos?.trueY != null) {
      ({ trueX, trueY } = pos);
    } else {
      console.warn("⚠️ handleMapClick missing coordinates");
      return;
    }

    console.log("📍 handleMapClick at:", { trueX, trueY });

    const snappedX = Math.floor(trueX / cellSize) * cellSize + cellSize / 2;
    const snappedY = Math.floor(trueY / cellSize) * cellSize + cellSize / 2;

    console.log("📐 Snapped coordinates:", { snappedX, snappedY });

    const shape = confirmPlacement({ x: snappedX, y: snappedY });
    console.log("📤 confirmPlacement returned:", shape);

    if (!shape) {
      console.warn("❌ No shape returned from confirmPlacement");
      return;
    }

    if (shape.rotating) {
      console.log("🔁 AoE is now rotating — waiting for final click to place.");
      return;
    }

    const finalShape = { ...shape, id: crypto.randomUUID() };
    console.log("✅ Final AoE shape to add:", finalShape);

    addAoEShape(finalShape);

    if (socket && socket.emit) {
      socket.emit("aoePlaced", {
        mapId,
        campaignId,
        aoe: finalShape,
      });
      console.log("📡 Emitted aoePlaced to socket");
    }

    clearDraft();
    setShowAoEToolbox(false);
    setActiveInteractionMode("select");
  };

  const confirmAoE = ({ type, radius, color }) => {
    console.log("🧰 AoE Confirm clicked. Hiding toolbox and preparing AoE...");

    setShowAoEToolbox(false);

    // Prevent input for 1 frame — suppress immediate clicks
    requestAnimationFrame(() => {
      console.log("🕒 Activating AoE mode after frame delay...");
      setActiveInteractionMode("aoe");
      startAoE(type, radius, color);
    });
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
      //   console.log("🧹 Remote AoE removal received:", aoeId);
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
