// Revised useAoEManager.js with console logging for debugging
import { useState, useEffect } from "react";

export const useAoEManager = (
  activeInteractionMode,
  cellSize,
  setActiveInteractionMode,
  socket,
  mapId,
  campaignId // ✅ new
) => {
  const [aoeDraft, setAoeDraft] = useState(null);
  const [aoeShapes, setAoeShapes] = useState([]);
  const [showAoEToolbox, setShowAoEToolbox] = useState(false);
  const [mousePosition, setMousePosition] = useState(null);

  useEffect(() => {
    console.log("🔁 Interaction mode changed:", activeInteractionMode);
    if (activeInteractionMode === "aoe") {
      console.log("🎯 Entering AoE mode");
      setShowAoEToolbox(true);
    } else {
      console.log("⬅️ Exiting AoE mode");
      setShowAoEToolbox(false);
      setAoeDraft(null);
    }
  }, [activeInteractionMode]);

  const handleMouseMove = (stageEvent) => {
    const stage = stageEvent.target.getStage();
    const pointer = stage.getPointerPosition();
    const scale = stage.scaleX();
    const stagePos = stage.position();
    const trueX = (pointer.x - stagePos.x) / scale;
    const trueY = (pointer.y - stagePos.y) / scale;
    console.log("🖱️ Mouse moved to:", { trueX, trueY });
    setMousePosition({ x: trueX, y: trueY });
  };

  const handleMapClick = (input) => {
    let trueX, trueY;

    if ("stage" in input) {
      trueX = input.trueX;
      trueY = input.trueY;
      console.log("🧭 AoE click (manual):", { trueX, trueY });
    } else {
      const stage = input.target.getStage();
      const pointerPos = stage.getPointerPosition();
      const scale = stage.scaleX();
      const stagePos = stage.position();
      trueX = (pointerPos.x - stagePos.x) / scale;
      trueY = (pointerPos.y - stagePos.y) / scale;
      console.log("🧭 AoE click (rect):", { trueX, trueY });
    }

    if (activeInteractionMode !== "aoe" || !aoeDraft) {
      console.log("⛔ Ignoring click — wrong mode or no draft");
      return;
    }

    const feetPerSquare = 5;
    const pixelRadius = (aoeDraft.radius / feetPerSquare) * cellSize;
    const snappedX = Math.floor(trueX / cellSize) * cellSize + cellSize / 2;
    const snappedY = Math.floor(trueY / cellSize) * cellSize + cellSize / 2;

    console.log("✅ Placing AoE at:", {
      x: snappedX,
      y: snappedY,
      radius: pixelRadius,
    });
    setAoeDraft((prev) => ({
      ...prev,
      x: snappedX,
      y: snappedY,
      radius: pixelRadius,
      placed: true,
    }));

    setShowAoEToolbox(false);
  };

  const confirmAoE = ({ type, radius, color }) => {
    console.log("📤 AoE confirmed from toolbox:", { type, radius, color });
    setAoeDraft({
      id: `aoe-${Date.now()}`,
      x: 0,
      y: 0,
      radius,
      color,
      type,
      placed: false,
    });
    setShowAoEToolbox(false);
  };

  const removeAoE = (id) => {
    console.log("❌ Removing AoE:", id);
    setAoeShapes((prev) => {
      const newMapAoEs = (prev[mapId] || []).filter((a) => a.id !== id);
      return {
        ...prev,
        [mapId]: newMapAoEs,
      };
    });

    // 📡 Emit to other clients
    if (socket && campaignId) {
      socket.emit("aoeRemoved", { campaignId, mapId, aoeId: id });
      console.log("📡 Emitted AoE removal:", { campaignId, mapId, aoeId: id });
    }
  };

  useEffect(() => {
    if (!campaignId) return;

    const handleRemoteAoERemoval = ({ mapId: incomingMapId, aoeId }) => {
      if (incomingMapId !== mapId) return;

      console.log("🧽 Received remote AoE removal:", aoeId);

      setAoeShapes((prev) => {
        const newMapAoEs = (prev[incomingMapId] || []).filter(
          (a) => a.id !== aoeId
        );
        return {
          ...prev,
          [incomingMapId]: newMapAoEs,
        };
      });
    };

    socket?.on("aoeRemoved", handleRemoteAoERemoval);
    return () => {
      socket?.off("aoeRemoved", handleRemoteAoERemoval);
    };
  }, [socket, mapId, campaignId]);

  useEffect(() => {
    if (!campaignId) return;

    const handleRemoteAoE = ({ mapId: incomingMapId, aoe }) => {
      if (incomingMapId !== mapId) return;

      console.log("📥 Received remote AoE:", aoe);

      setAoeShapes((prev) => ({
        ...prev,
        [incomingMapId]: [...(prev[incomingMapId] || []), aoe],
      }));
    };

    socket?.on("aoePlaced", handleRemoteAoE);
    return () => {
      socket?.off("aoePlaced", handleRemoteAoE);
    };
  }, [socket, mapId, campaignId]);

  useEffect(() => {
    if (!aoeDraft?.placed || !campaignId) return;

    console.log("🎯 AoE placed, saving to shapes:", aoeDraft);

    setAoeShapes((prev) => ({
      ...prev,
      [mapId]: [...(prev[mapId] || []), aoeDraft],
    }));

    // 📡 Emit AoE placement to other clients
    socket?.emit("aoePlaced", {
      campaignId,
      mapId,
      aoe: aoeDraft,
    });
    console.log("📡 Emitted AoE placement:", {
      campaignId,
      mapId,
      aoe: aoeDraft,
    });

    if (typeof setActiveInteractionMode === "function") {
      console.log("🔄 Switching back to 'select' mode after AoE placement");
      setActiveInteractionMode("select");
    }

    setAoeDraft(null);
  }, [aoeDraft, setActiveInteractionMode, socket, mapId, campaignId]);

  return {
    aoeDraft,
    aoeShapes,
    showAoEToolbox,
    mousePosition,
    handleMouseMove,
    handleMapClick,
    confirmAoE,
    removeAoE,
  };
};
