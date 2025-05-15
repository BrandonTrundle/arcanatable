import React, { forwardRef } from "react";
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
  ({ width, height, children, onDrop, onDragOver, onMouseMove }, ref) => {
    const handleWheel = (e) => {
      handleWheelEvent(ref?.current, e);
    };

    return (
      <Stage
        tabIndex={0}
        draggable
        ref={ref}
        width={width}
        height={height}
        onWheel={handleWheel}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMouseMove={onMouseMove}
      >
        {children}
      </Stage>
    );
  }
);

export default ZoomableStage;
