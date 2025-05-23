import { useRef } from "react";
import { useDropHandler } from "../../../hooks/useDropHandler";
import { useOutsideClickHandler } from "../../../hooks/useOutsideClickHandler";

export const useMapUIBindings = ({ handleDrop, setContextMenu, stageRef }) => {
  const containerRef = useRef(null);

  const { onDrop, onDragOver } = useDropHandler(handleDrop, stageRef);

  useOutsideClickHandler("token-context-menu", () => setContextMenu(null));

  return {
    containerRef,
    onDrop,
    onDragOver,
  };
};
