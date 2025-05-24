import React from "react";
import { Line } from "react-konva";

const GridOverlay = ({ width, height, cellSize, lineOpacity = 0.3 }) => {
  const gridWidth = width * cellSize;
  const gridHeight = height * cellSize;

  const verticalLines = Array.from({ length: width + 1 }, (_, i) => (
    <Line
      key={`v-${i}`}
      points={[i * cellSize, 0, i * cellSize, gridHeight]}
      stroke="white"
      strokeWidth={1}
      opacity={lineOpacity}
    />
  ));

  const horizontalLines = Array.from({ length: height + 1 }, (_, i) => (
    <Line
      key={`h-${i}`}
      points={[0, i * cellSize, gridWidth, i * cellSize]}
      stroke="white"
      strokeWidth={1}
      opacity={lineOpacity}
    />
  ));

  return (
    <>
      {verticalLines}
      {horizontalLines}
    </>
  );
};

export default GridOverlay;
