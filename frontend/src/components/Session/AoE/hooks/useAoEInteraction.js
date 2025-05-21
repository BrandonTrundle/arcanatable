import { useCallback, useState, useEffect } from "react";

export const useAoEInteraction = ({
  activeInteractionMode,
  selectedTokenId,
  stageRef,
  addAOE,
}) => {
  const [isDraggingAoE, setIsDraggingAoE] = useState(false);
  const [aoeDragOrigin, setAoeDragOrigin] = useState(null);
  const [aoeDragTarget, setAoeDragTarget] = useState(null);
  const [selectedShape, setSelectedShape] = useState("cone");
  const [isAnchored, setIsAnchored] = useState(true);

  const handleMouseDown = useCallback(
    (e) => {
      if (activeInteractionMode !== "aoe" || !selectedTokenId) return;

      const stage = stageRef.current?.getStage();
      const pointer = stage?.getPointerPosition();
      if (!pointer) return;

      const transform = stage.getAbsoluteTransform().copy().invert();
      const origin = transform.point(pointer);

      setAoeDragOrigin(origin);
      setAoeDragTarget(origin);
      setIsDraggingAoE(true);
    },
    [activeInteractionMode, selectedTokenId, stageRef]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDraggingAoE || activeInteractionMode !== "aoe") return;

      const stage = stageRef.current?.getStage();
      const pointer = stage?.getPointerPosition();
      if (!pointer) return;

      const transform = stage.getAbsoluteTransform().copy().invert();
      const target = transform.point(pointer);

      setAoeDragTarget(target);
    },
    [isDraggingAoE, activeInteractionMode, stageRef]
  );

  const handleMouseUp = useCallback(
    (e) => {
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

      const newAoE = {
        type: selectedShape,
        anchored: isAnchored,
        x: selectedShape === "circle" ? aoeDragTarget.x : aoeDragOrigin.x,
        y: selectedShape === "circle" ? aoeDragTarget.y : aoeDragOrigin.y,
        radius: 150,
        angle: selectedShape === "cone" ? 60 : undefined,
        width:
          selectedShape === "line" ||
          selectedShape === "rectangle" ||
          selectedShape === "square"
            ? selectedShape === "square"
              ? 120
              : 200
            : undefined,
        height:
          selectedShape === "rectangle" || selectedShape === "square"
            ? selectedShape === "square"
              ? 120
              : 100
            : undefined,
        direction: angle,
        sourceTokenId: selectedTokenId,
        color: "rgba(255, 165, 0, 0.5)",
      };

      addAOE(newAoE);

      setIsDraggingAoE(false);
      setAoeDragOrigin(null);
      setAoeDragTarget(null);
    },
    [
      isDraggingAoE,
      aoeDragOrigin,
      aoeDragTarget,
      addAOE,
      selectedTokenId,
      selectedShape,
      isAnchored,
    ]
  );

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
