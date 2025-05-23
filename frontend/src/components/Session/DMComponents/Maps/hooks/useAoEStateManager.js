import { useState } from "react";
import { useAoEInteraction } from "../../../AoE/hooks/useAoEInteraction";

export const useAoEStateManager = ({
  activeInteractionMode,
  setActiveInteractionMode,
  selectedTokenId,
  stageRef,
  addAOE,
  cellSize,
  initialSnapMode = "center",
  initialShapeSettings = {
    cone: { radius: 150, angle: 60, color: "#ff0000" },
    circle: { radius: 100, color: "#ff0000" },
    square: { width: 30, color: "#00ff00" },
    rectangle: { width: 40, height: 20, color: "#ff0000" },
    line: { width: 40, height: 5, color: "#ff0000" },
  },
}) => {
  const [snapMode, setSnapMode] = useState(initialSnapMode);
  const [shapeSettings, setShapeSettings] = useState(initialShapeSettings);

  const {
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
  } = useAoEInteraction({
    activeInteractionMode,
    setActiveInteractionMode,
    selectedTokenId,
    stageRef,
    addAOE,
    shapeSettings,
    cellSize,
    snapMode,
  });

  return {
    snapMode,
    setSnapMode,
    shapeSettings,
    setShapeSettings,
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
