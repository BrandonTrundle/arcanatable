import { useCallback } from "react";

export const useDropHandler = (handleDrop, stageRef) => {
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();

      const stage = stageRef?.current?.getStage?.();
      if (!stage) return;

      stage.setPointersPositions(e);
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const scale = stage.scale();
      const position = stage.position(); // 🔁 Pan offset

      const trueX = (pointerPos.x - position.x) / scale.x;
      const trueY = (pointerPos.y - position.y) / scale.y;

      // console.log("📐 True drop position:", { trueX, trueY });

      handleDrop({
        trueX,
        trueY,
        originalEvent: e,
      });
    },
    [handleDrop, stageRef]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  return { onDrop, onDragOver };
};
