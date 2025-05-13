import React from "react";
import { Layer, Circle, Line } from "react-konva";

const AoELayer = ({ aoeShapes, aoeDraft, mapId, mousePosition, removeAoE }) => {
  console.log("🔍 AoE Draft:", aoeDraft);
  console.log("🖱️ Mouse Position:", mousePosition);
  const renderCone = (
    x,
    y,
    radius,
    angle,
    direction,
    color,
    key,
    options = {}
  ) => {
    const segments = 30;
    const angleRad = (angle * Math.PI) / 180;
    const directionRad = (direction * Math.PI) / 180;
    const points = [x, y];

    for (let i = 0; i <= segments; i++) {
      const t = directionRad - angleRad / 2 + (angleRad * i) / segments;
      points.push(x + radius * Math.cos(t));
      points.push(y + radius * Math.sin(t));
    }

    return (
      <Line
        key={key}
        points={points}
        fill={color}
        stroke="black"
        strokeWidth={2}
        closed
        onContextMenu={(e) => {
          if (options.onRightClick) {
            e.evt.preventDefault();
            options.onRightClick(e);
          }
        }}
        {...options}
      />
    );
  };

  const renderCircle = (x, y, radius, color, key, options = {}) => (
    <Circle
      key={key}
      x={x}
      y={y}
      radius={radius}
      fill={color}
      stroke="black"
      strokeWidth={2}
      onContextMenu={(e) => {
        if (options.onRightClick) {
          e.evt.preventDefault();
          options.onRightClick(e);
        }
      }}
      {...options}
    />
  );

  const currentAoEs = aoeShapes[mapId] || [];

  return (
    <>
      <Layer>
        {currentAoEs.map((aoe) =>
          aoe.type === "cone"
            ? renderCone(
                aoe.x,
                aoe.y,
                aoe.radius,
                aoe.angle,
                aoe.direction,
                aoe.color,
                aoe.id,
                {
                  onRightClick: () => {
                    console.log(
                      "🗑️ Cone AoE right-clicked for removal:",
                      aoe.id
                    );
                    removeAoE(aoe.id);
                  },
                }
              )
            : renderCircle(aoe.x, aoe.y, aoe.radius, aoe.color, aoe.id, {
                onRightClick: () => {
                  console.log("🗑️ AoE right-clicked for removal:", aoe.id);
                  removeAoE(aoe.id);
                },
              })
        )}
      </Layer>

      <Layer id="aoe-preview-layer">
        {aoeDraft &&
          !aoeDraft.placed &&
          mousePosition &&
          (aoeDraft.type === "cone"
            ? renderCone(
                mousePosition.x,
                mousePosition.y,
                aoeDraft.radius,
                aoeDraft.angle ?? 90,
                aoeDraft.direction ?? 0,
                aoeDraft.color,
                "aoe-preview",
                {
                  stroke: "#ffd700",
                  dash: [10, 4],
                  opacity: 0.6,
                  shadowColor: "black",
                  shadowBlur: 5,
                  listening: false,
                }
              )
            : renderCircle(
                mousePosition.x,
                mousePosition.y,
                aoeDraft.radius,
                aoeDraft.color,
                "aoe-preview",
                {
                  stroke: "#ffd700",
                  dash: [10, 4],
                  opacity: 0.6,
                  shadowColor: "black",
                  shadowBlur: 5,
                  listening: false,
                }
              ))}
      </Layer>
    </>
  );
};

export default AoELayer;
