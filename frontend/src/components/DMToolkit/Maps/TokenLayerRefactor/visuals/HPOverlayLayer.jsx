import React from "react";
import { Layer, Circle } from "react-konva";

const HPOverlayLayer = ({ tokens }) => {
  const sizeSettings = {
    Tiny: { radius: 18, x: 17, y: 16 },
    Small: { radius: 32, x: 32, y: 30 },
    Medium: { radius: 32, x: 32, y: 30 },
    Large: { radius: 65, x: 66, y: 64 },
    Huge: { radius: 96, x: 96, y: 94 },
    Gargantuan: { radius: 130, x: 129, y: 128 },
  };

  return (
    <Layer>
      {tokens.map((token) => {
        const { currentHP, maxHP, size = "Medium", x, y, id } = token;
        if (typeof currentHP !== "number" || typeof maxHP !== "number")
          return null;

        const ratio = Math.max(0, currentHP / maxHP);
        let color = "green";
        if (ratio <= 0.33) color = "red";
        else if (ratio <= 0.66) color = "yellow";

        const {
          radius,
          x: dx,
          y: dy,
        } = sizeSettings[size] || sizeSettings["Medium"];

        return (
          <Circle
            key={`hpbar-${id}-${currentHP}-${maxHP}`}
            x={x + dx}
            y={y + dy}
            radius={radius}
            stroke={color}
            strokeWidth={6}
            opacity={0.8}
            listening={false}
          />
        );
      })}
    </Layer>
  );
};

export default HPOverlayLayer;
