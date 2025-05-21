import { useState } from "react";

export const useAoEDraft = (cellSize) => {
  const [aoeDraft, setAoEDraft] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);

  const handleMouseMove = (e, stageRef) => {
    const stage = stageRef?.current?.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scale = stage.scaleX();
    const stagePos = stage.position();

    const trueX = (pointer.x - stagePos.x) / scale;
    const trueY = (pointer.y - stagePos.y) / scale;

    if (!aoeDraft?.rotating) {
      setMousePosition({ x: trueX, y: trueY });
    }

    // ➕ If in rotating phase, calculate angle
    if (
      aoeDraft?.rotating &&
      aoeDraft?.placed &&
      aoeDraft?.x != null &&
      aoeDraft?.y != null
    ) {
      const dx = trueX - aoeDraft.x;
      const dy = trueY - aoeDraft.y;
      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

      setAoEDraft((prev) => ({
        ...prev,
        direction: angleDeg,
      }));
    }
  };

  const startAoE = (
    type = "circle",
    size = 20,
    color = "rgba(255,0,0,0.4)"
  ) => {
    const draft = {
      type,
      radius: (size / 5) * cellSize,
      color,
      placed: false,
      rotating: false,
      direction: 0,
    };

    console.log("🚀 AoE started with draft:", draft);

    setAoEDraft(draft);
  };

  const confirmPlacement = (pos) => {
    if (!aoeDraft) {
      console.warn("❌ confirmPlacement called without draft");
      return null;
    }

    if (!aoeDraft.placed) {
      const target = pos ?? mousePosition;
      if (!target) {
        console.warn("❌ confirmPlacement has no target position");
        return null;
      }

      const snappedX =
        Math.floor(target.x / cellSize) * cellSize + cellSize / 2;
      const snappedY =
        Math.floor(target.y / cellSize) * cellSize + cellSize / 2;

      console.log("📌 AoE placement snap at:", { snappedX, snappedY });

      const updatedDraft = {
        ...aoeDraft,
        x: snappedX,
        y: snappedY,
        placed: true,
        rotating: true,
      };

      setMousePosition({ x: snappedX, y: snappedY });
      setAoEDraft(updatedDraft);
      return updatedDraft;
    }

    if (aoeDraft.rotating) {
      console.log("🔁 Finalizing AoE rotation:", aoeDraft);
      const finalizedAoE = {
        ...aoeDraft,
        rotating: false,
      };
      setAoEDraft(null);
      setMousePosition(null);
      return finalizedAoE;
    }

    return null;
  };

  const clearDraft = () => {
    setAoEDraft(null);
    setMousePosition(null);
  };

  return {
    aoeDraft,
    mousePosition,
    handleMouseMove,
    startAoE,
    confirmPlacement,
    clearDraft,
  };
};
