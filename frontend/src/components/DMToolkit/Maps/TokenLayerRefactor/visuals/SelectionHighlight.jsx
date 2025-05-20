import React from "react";
import { Rect } from "react-konva";

const SelectionHighlight = ({ size }) => (
  <Rect
    width={size + 10}
    height={size + 10}
    offsetX={5}
    offsetY={5}
    fill="rgba(255, 255, 0, 0.2)"
    stroke="gold"
    strokeWidth={4}
    cornerRadius={size / 2}
  />
);

export default SelectionHighlight;
