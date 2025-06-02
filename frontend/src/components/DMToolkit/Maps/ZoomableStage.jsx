import React, { useEffect, forwardRef } from "react";
import { Stage } from "react-konva";

export function handleWheelEvent(stage, e) {
  e.evt.preventDefault();
  if (!stage) return;

  const oldScale = stage.scaleX();
  const scaleBy = 1.05;

  const pointer = stage.getPointerPosition();
  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  const direction = e.evt.deltaY > 0 ? 1 : -1;
  const newScale = direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;
  const clampedScale = Math.min(Math.max(newScale, 0.5), 3);

  stage.scale({ x: clampedScale, y: clampedScale });

  const newPos = {
    x: pointer.x - mousePointTo.x * clampedScale,
    y: pointer.y - mousePointTo.y * clampedScale,
  };
  stage.position(newPos);
  stage.batchDraw();
}

const ZoomableStage = forwardRef(
  (
    {
      width,
      height,
      children,
      onDrop,
      onDragOver,
      onMouseMove,
      onMouseDown,
      onClick,
      activeInteractionMode,
    },
    ref
  ) => {
    const handleWheel = (e) => {
      handleWheelEvent(ref?.current, e);
    };

    // ✅ Initial debug log & scale reset
    useEffect(() => {
      const stage = ref?.current;
      if (!stage) {
        console.warn("[🛑 ZoomableStage] No stageRef available.");
        return;
      }

      const scaleX = stage.scaleX();
      const scaleY = stage.scaleY();
      const x = stage.x();
      const y = stage.y();

      console.log("[🎥 ZoomableStage] Initial stage state", {
        width: stage.width(),
        height: stage.height(),
        scaleX,
        scaleY,
        x,
        y,
      });

      const invalidScale = scaleX === 0 || isNaN(scaleX);
      const invalidPos = isNaN(x) || isNaN(y);

      if (invalidScale || invalidPos) {
        console.warn(
          "[⚠️ ZoomableStage] Resetting stage transform due to invalid state."
        );
        stage.scale({ x: 1, y: 1 });
        stage.position({ x: 0, y: 0 });
        stage.batchDraw();
      }
    }, [ref]);

    return (
      <Stage
        tabIndex={0}
        draggable={activeInteractionMode !== "aoe"}
        ref={ref}
        width={width}
        height={height}
        onWheel={handleWheel}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onClick={onClick}
      >
        {children}
      </Stage>
    );
  }
);

export default ZoomableStage;
