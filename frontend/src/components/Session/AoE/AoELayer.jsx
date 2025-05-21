import React from "react";
import { Layer, Circle, Arc, Rect } from "react-konva";

const AoELayer = ({
  aoes,
  selectedTokenId,
  activeInteractionMode,
  getTokenById,
  isDraggingAoE,
  aoeDragOrigin,
  aoeDragTarget,
  selectedShape, // ⬅️ Add this
}) => {
  if (!aoes?.length && !isDraggingAoE) return null;

  // Debug: show drag values
  if (isDraggingAoE) {
    //console.log("Dragging AoE from", aoeDragOrigin, "to", aoeDragTarget);
  }

  return (
    <Layer listening={true}>
      {/* Render placed AoEs */}
      {aoes.map((aoe) => {
        const dx = aoe.dx || 0;
        const dy = aoe.dy || 0;

        switch (aoe.type) {
          case "circle":
            return (
              <Circle
                key={aoe.id}
                x={aoe.x}
                y={aoe.y}
                radius={aoe.radius || 100}
                fill={aoe.color || "rgba(255, 0, 0, 0.4)"}
              />
            );

          case "cone":
            return (
              <Arc
                key={aoe.id}
                x={aoe.x}
                y={aoe.y}
                innerRadius={0}
                outerRadius={aoe.radius || 150}
                angle={aoe.angle || 60}
                rotation={aoe.direction || 0}
                fill={aoe.color || "rgba(255, 0, 0, 0.4)"}
              />
            );

          case "rectangle":
          case "square":
          case "line": {
            const width = aoe.width || 120;
            const height =
              aoe.type === "line" ? aoe.height || 20 : aoe.height || width;

            return (
              <Rect
                key={aoe.id}
                x={aoe.x}
                y={aoe.y}
                width={width}
                height={height}
                fill={aoe.color || "rgba(255, 0, 0, 0.4)"}
                stroke="black"
                strokeWidth={1}
                offsetX={width / 2}
                offsetY={height / 2}
                rotation={aoe.direction || 0}
              />
            );
          }

          default:
            return null;
        }
      })}

      {/* Optional: test arc */}
      {/* <Arc
        x={300}
        y={300}
        innerRadius={0}
        outerRadius={150}
        angle={60}
        rotation={45}
        fill="rgba(0,255,0,0.3)"
        stroke="black"
        strokeWidth={2}
      /> */}

      {/* Render cone preview during drag */}
      {activeInteractionMode === "aoe" &&
        isDraggingAoE &&
        aoeDragOrigin &&
        aoeDragTarget &&
        Math.hypot(
          aoeDragTarget.x - aoeDragOrigin.x,
          aoeDragTarget.y - aoeDragOrigin.y
        ) > 5 &&
        (() => {
          const dx = aoeDragTarget.x - aoeDragOrigin.x;
          const dy = aoeDragTarget.y - aoeDragOrigin.y;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          switch (selectedShape) {
            case "cone":
              return (
                <Arc
                  x={aoeDragOrigin.x}
                  y={aoeDragOrigin.y}
                  innerRadius={0}
                  outerRadius={150}
                  angle={60}
                  rotation={angle}
                  fill="rgba(255, 165, 0, 0.3)"
                  stroke="orange"
                  strokeWidth={2}
                  opacity={0.6}
                  dash={[10, 5]}
                />
              );

            case "circle":
              return (
                <Circle
                  x={aoeDragTarget.x}
                  y={aoeDragTarget.y}
                  radius={100}
                  fill="rgba(255, 165, 0, 0.3)"
                  stroke="orange"
                  strokeWidth={2}
                />
              );

            case "rectangle":
            case "square":
            case "line": {
              const width =
                selectedShape === "square"
                  ? 120
                  : selectedShape === "line"
                  ? 200
                  : 160;
              const height =
                selectedShape === "square"
                  ? 120
                  : selectedShape === "line"
                  ? 20
                  : 100;

              return (
                <Rect
                  x={aoeDragOrigin.x - width / 2}
                  y={aoeDragOrigin.y - height / 2}
                  width={width}
                  height={height}
                  fill="rgba(255, 165, 0, 0.3)"
                  stroke="orange"
                  strokeWidth={2}
                  rotation={angle}
                  offsetX={width / 2}
                  offsetY={height / 2}
                />
              );
            }

            default:
              return null;
          }
        })()}
    </Layer>
  );
};

export default AoELayer;
