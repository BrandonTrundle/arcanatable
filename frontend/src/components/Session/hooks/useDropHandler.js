import { useCallback } from "react";

export const useDropHandler = (handleDrop, stageRef) => {
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      handleDrop(e, stageRef);
    },
    [handleDrop, stageRef]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  return { onDrop, onDragOver };
};
