import React, { memo } from "react";
import { Circle } from "react-konva";

const HPOverlay = ({
  currentHP,
  maxHP,
  tokenSize = "Medium",
  x: overrideX,
  y: overrideY,
}) => {
  const ratio = Math.max(0, currentHP / maxHP);

  let color = "green";
  if (ratio <= 0.33) color = "red";
  else if (ratio <= 0.66) color = "yellow";

  const sizeSettings = {
    Tiny: { radius: 18, x: 17, y: 16 },
    Small: { radius: 32, x: 32, y: 30 },
    Medium: { radius: 32, x: 32, y: 30 },
    Large: { radius: 65, x: 66, y: 64 },
    Huge: { radius: 96, x: 96, y: 94 },
    Gargantuan: { radius: 130, x: 129, y: 128 },
  };

  const {
    radius,
    x: defaultX,
    y: defaultY,
  } = sizeSettings[tokenSize] || sizeSettings["Medium"];
  const x = overrideX ?? defaultX;
  const y = overrideY ?? defaultY;

  return (
    <Circle
      key={`hp-${currentHP}-${maxHP}-${color}`} // 👈 force re-render
      x={x}
      y={y}
      radius={radius}
      stroke={color}
      strokeWidth={6}
      opacity={0.8}
      listening={false}
    />
  );
};

export default memo(HPOverlay);
