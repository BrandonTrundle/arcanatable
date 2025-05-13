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

    setMousePosition({ x: trueX, y: trueY });
  };

  const startAoE = (
    type = "circle",
    size = 20,
    color = "rgba(255,0,0,0.4)"
  ) => {
    setAoEDraft({
      type,
      radius: (size / 5) * cellSize,
      color,
      placed: false,
    });
  };

  const confirmPlacement = () => {
    if (!aoeDraft || !mousePosition) return null;

    return {
      ...aoeDraft,
      x: mousePosition.x,
      y: mousePosition.y,
      placed: true,
    };
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
