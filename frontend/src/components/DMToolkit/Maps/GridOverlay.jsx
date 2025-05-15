import React from "react";
import { Line } from "react-konva";

const GridOverlay = ({ width, height, cellSize }) => {
  const gridWidth = width * cellSize;
  const gridHeight = height * cellSize;

  const verticalLines = Array.from({ length: width + 1 }, (_, i) => (
    <Line
      key={`v-${i}`}
      points={[i * cellSize, 0, i * cellSize, gridHeight]}
      stroke="red"
      strokeWidth={1}
    />
  ));

  const horizontalLines = Array.from({ length: height + 1 }, (_, i) => (
    <Line
      key={`h-${i}`}
      points={[0, i * cellSize, gridWidth, i * cellSize]}
      stroke="blue"
      strokeWidth={1}
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
