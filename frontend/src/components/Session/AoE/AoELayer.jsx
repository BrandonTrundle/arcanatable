import React from "react";
import { Layer, Circle, Arc, Rect } from "react-konva";

const hexWithAlpha = (hex, alpha = 0.4) => {
  if (!hex?.startsWith("#") || hex.length !== 7) return hex;
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return hex + alphaHex;
};

const AoELayer = ({
  aoes,
  selectedTokenId,
  activeInteractionMode,
  getTokenById,
  isDraggingAoE,
  aoeDragOrigin,
  aoeDragTarget,
  selectedShape,
  onAoERightClick,
  shapeSettings,
  cellSize,
}) => {
  if (!aoes?.length && !isDraggingAoE) return null;

  const feetToPixels = (feet) => (cellSize / 5) * feet;
  const settings = shapeSettings?.[selectedShape] || {};
  const previewColor = hexWithAlpha(settings.color || "#ffa500", 0.4);
  const previewOpacity = 0.6;

  return (
    <Layer listening={true}>
      {/* Render placed AoEs */}
      {aoes.map((aoe) => {
        switch (aoe.type) {
          case "circle":
            return (
              <Circle
                key={aoe.id}
                x={aoe.x}
                y={aoe.y}
                radius={aoe.radius || 100}
                fill={aoe.color || "rgba(255, 0, 0, 0.4)"}
                opacity={aoe.opacity ?? 0.4}
                onContextMenu={(e) => {
                  e.evt.preventDefault();
                  onAoERightClick?.(aoe);
                }}
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
                opacity={aoe.opacity ?? 0.4}
                onContextMenu={(e) => {
                  e.evt.preventDefault();
                  onAoERightClick?.(aoe);
                }}
              />
            );

          case "square": {
            const width = aoe.width || 120;
            return (
              <Rect
                key={aoe.id}
                x={aoe.x - width / 2}
                y={aoe.y - width / 2}
                width={width}
                height={width}
                fill={aoe.color || "rgba(255, 0, 0, 0.4)"}
                opacity={aoe.opacity ?? 0.4}
                stroke="black"
                strokeWidth={1}
                onContextMenu={(e) => {
                  e.evt.preventDefault();
                  onAoERightClick?.(aoe);
                }}
              />
            );
          }

          case "rectangle":
          case "line": {
            const width = aoe.width || 120;
            const height = aoe.height || 40;

            return (
              <Rect
                key={aoe.id}
                x={aoe.x}
                y={aoe.y}
                width={width}
                height={height}
                fill={aoe.color || "rgba(255, 0, 0, 0.4)"}
                opacity={aoe.opacity ?? 0.4}
                stroke="black"
                strokeWidth={1}
                offsetX={width / 2}
                offsetY={height / 2}
                rotation={aoe.direction || 0}
                onContextMenu={(e) => {
                  e.evt.preventDefault();
                  onAoERightClick?.(aoe);
                }}
              />
            );
          }

          default:
            return null;
        }
      })}

      {/* Render preview during AoE drag */}
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
                  outerRadius={feetToPixels(settings.radius || 30)}
                  angle={settings.angle || 60}
                  rotation={angle}
                  fill={previewColor}
                  stroke="black"
                  strokeWidth={1}
                  opacity={previewOpacity}
                  dash={[10, 5]}
                />
              );

            case "circle":
              return (
                <Circle
                  x={aoeDragTarget.x}
                  y={aoeDragTarget.y}
                  radius={feetToPixels(settings.radius || 20)}
                  fill={previewColor}
                  stroke="black"
                  strokeWidth={1}
                  opacity={previewOpacity}
                />
              );

            case "square": {
              const width = feetToPixels(settings.width || 30);
              return (
                <Rect
                  x={aoeDragTarget.x - width / 2}
                  y={aoeDragTarget.y - width / 2}
                  width={width}
                  height={width}
                  fill={previewColor}
                  stroke="black"
                  strokeWidth={1}
                  opacity={previewOpacity}
                  dash={[10, 5]}
                />
              );
            }

            case "rectangle":
            case "line": {
              const width = feetToPixels(settings.width || 40);
              const height = feetToPixels(settings.height || 20);
              return (
                <Rect
                  x={aoeDragTarget.x - width / 2}
                  y={aoeDragTarget.y - height / 2}
                  width={width}
                  height={height}
                  fill={previewColor}
                  stroke="black"
                  strokeWidth={1}
                  opacity={previewOpacity}
                  dash={[10, 5]}
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
