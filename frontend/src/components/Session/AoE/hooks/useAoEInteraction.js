import { useCallback, useState, useEffect } from "react";

export const useAoEInteraction = ({
  activeInteractionMode,
  selectedTokenId,
  stageRef,
  addAOE,
  shapeSettings,
  cellSize,
  snapMode,
  setActiveInteractionMode,
}) => {
  const [isDraggingAoE, setIsDraggingAoE] = useState(false);
  const [aoeDragOrigin, setAoeDragOrigin] = useState(null);
  const [aoeDragTarget, setAoeDragTarget] = useState(null);
  const [selectedShape, setSelectedShape] = useState("cone");
  const [isAnchored, setIsAnchored] = useState(true);

  const snapToGridCenter = (value) =>
    Math.floor(value / cellSize) * cellSize + cellSize / 2;

  const snapToGridCorner = (value) => Math.floor(value / cellSize) * cellSize;

  const feetToPixels = (feet) => (cellSize / 5) * feet;

  const getSnapped = (value) =>
    snapMode === "corner" ? snapToGridCorner(value) : snapToGridCenter(value);

  const snapToNearestCorner = (x, y) => {
    const baseX = Math.floor(x / cellSize) * cellSize;
    const baseY = Math.floor(y / cellSize) * cellSize;

    const offsetX = x % cellSize;
    const offsetY = y % cellSize;

    const snapX = baseX + (offsetX >= cellSize / 2 ? cellSize : 0);
    const snapY = baseY + (offsetY >= cellSize / 2 ? cellSize : 0);

    return { x: snapX, y: snapY };
  };

  const handleMouseDown = useCallback(() => {
    if (activeInteractionMode !== "aoe" || !selectedTokenId) return;

    const stage = stageRef.current?.getStage();
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;

    const transform = stage.getAbsoluteTransform().copy().invert();
    const origin = transform.point(pointer);

    setAoeDragOrigin(origin);
    setAoeDragTarget(origin);
    setIsDraggingAoE(true);
  }, [activeInteractionMode, selectedTokenId, stageRef]);

  const handleMouseMove = useCallback(() => {
    if (!isDraggingAoE || activeInteractionMode !== "aoe") return;

    const stage = stageRef.current?.getStage();
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;

    const transform = stage.getAbsoluteTransform().copy().invert();
    const target = transform.point(pointer);

    setAoeDragTarget(target);
  }, [isDraggingAoE, activeInteractionMode, stageRef]);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingAoE || !aoeDragOrigin || !aoeDragTarget) return;

    const dx = aoeDragTarget.x - aoeDragOrigin.x;
    const dy = aoeDragTarget.y - aoeDragOrigin.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const dragDistance = Math.hypot(dx, dy);

    if (dragDistance < 5) {
      setIsDraggingAoE(false);
      setAoeDragOrigin(null);
      setAoeDragTarget(null);
      return;
    }

    const settings = shapeSettings?.[selectedShape] || {};

    // ✅ Determine unsnapped origin point
    let rawX, rawY;

    if (isAnchored) {
      const stage = stageRef.current?.getStage();
      const tokenNode = stage?.findOne(
        (node) => node.attrs.id === selectedTokenId
      );

      if (tokenNode) {
        rawX = tokenNode.x();
        rawY = tokenNode.y();
      } else {
        rawX = aoeDragTarget.x;
        rawY = aoeDragTarget.y;
      }
    } else {
      rawX =
        selectedShape === "circle" ||
        selectedShape === "square" ||
        selectedShape === "rectangle"
          ? aoeDragTarget.x
          : aoeDragOrigin.x;

      rawY =
        selectedShape === "circle" ||
        selectedShape === "square" ||
        selectedShape === "rectangle"
          ? aoeDragTarget.y
          : aoeDragOrigin.y;
    }

    // ✅ Snap to appropriate mode
    let snappedX, snappedY;

    if (snapMode === "corner") {
      const baseX = Math.floor(rawX / cellSize) * cellSize;
      const baseY = Math.floor(rawY / cellSize) * cellSize;

      const offsetX = rawX % cellSize;
      const offsetY = rawY % cellSize;

      snappedX = baseX + (offsetX >= cellSize / 2 ? cellSize : 0);
      snappedY = baseY + (offsetY >= cellSize / 2 ? cellSize : 0);
    } else {
      snappedX = Math.floor(rawX / cellSize) * cellSize + cellSize / 2;
      snappedY = Math.floor(rawY / cellSize) * cellSize + cellSize / 2;
    }

    const newAoE = {
      type: selectedShape,
      anchorTokenId: isAnchored ? selectedTokenId : null,
      anchored: isAnchored,
      x: snappedX,
      y: snappedY,
      radius: settings.radius ? feetToPixels(settings.radius) : 150,
      angle: selectedShape === "cone" ? settings.angle || 60 : undefined,
      width:
        selectedShape === "rectangle" || selectedShape === "line"
          ? feetToPixels(settings.width || 40)
          : selectedShape === "square"
          ? feetToPixels(settings.width || 30)
          : undefined,
      height:
        selectedShape === "rectangle"
          ? feetToPixels(settings.height || 20)
          : selectedShape === "square"
          ? feetToPixels(settings.width || 30)
          : selectedShape === "line"
          ? feetToPixels(settings.height || 5)
          : undefined,
      direction:
        selectedShape === "square" || selectedShape === "rectangle"
          ? undefined
          : angle,
      sourceTokenId: selectedTokenId,
      color: settings.color || "rgba(255, 165, 0, 0.5)",
    };

    addAOE(newAoE);

    // ✅ Automatically switch back to Select Tool
    if (typeof setActiveInteractionMode === "function") {
      setActiveInteractionMode("select");
    }

    setIsDraggingAoE(false);
    setAoeDragOrigin(null);
    setAoeDragTarget(null);
  }, [
    isDraggingAoE,
    aoeDragOrigin,
    aoeDragTarget,
    addAOE,
    selectedTokenId,
    selectedShape,
    isAnchored,
    shapeSettings,
    cellSize,
    snapMode,
    stageRef,
  ]);

  useEffect(() => {
    const handleWindowMouseUp = (e) => {
      if (!isDraggingAoE) return;
      handleMouseUp(e);
    };

    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isDraggingAoE, handleMouseUp]);

  return {
    selectedShape,
    setSelectedShape,
    isAnchored,
    setIsAnchored,
    isDraggingAoE,
    aoeDragOrigin,
    aoeDragTarget,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
