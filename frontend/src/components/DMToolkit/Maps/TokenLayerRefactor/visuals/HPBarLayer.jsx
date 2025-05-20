import React from "react";
import { Layer, Rect } from "react-konva"; // ✅ import Konva components!

const HPBarLayer = ({ tokens }) => {
  return (
    <Layer>
      {tokens.map((token) => {
        const { id, x, y, size = "Medium", currentHP, maxHP } = token;

        if (
          typeof currentHP !== "number" ||
          typeof maxHP !== "number" ||
          maxHP === 0
        )
          return null;

        const ratio = Math.max(0, currentHP / maxHP);

        let color = "green";
        if (ratio <= 0.33) color = "red";
        else if (ratio <= 0.66) color = "yellow";

        const sizeMap = {
          Tiny: 30,
          Small: 50,
          Medium: 50,
          Large: 100,
          Huge: 140,
          Gargantuan: 180,
        };

        const barWidth = sizeMap[size] || 50;
        const barHeight = 6;
        const filledWidth = barWidth * ratio;

        return (
          <React.Fragment key={`hpbar-${id}`}>
            <Rect
              x={x}
              y={y + (sizeMap[size] || 50) + 2}
              width={barWidth}
              height={barHeight}
              fill="rgba(0,0,0,0.5)"
              cornerRadius={3}
              listening={false}
            />
            <Rect
              x={x}
              y={y + (sizeMap[size] || 50) + 2}
              width={filledWidth}
              height={barHeight}
              fill={color}
              cornerRadius={3}
              listening={false}
            />
          </React.Fragment>
        );
      })}
    </Layer>
  );
};

export default HPBarLayer;
