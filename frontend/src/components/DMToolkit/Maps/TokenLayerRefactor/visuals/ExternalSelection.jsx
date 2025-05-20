import React from "react";
import { Rect, Text } from "react-konva";

const ExternalSelection = ({ size, selectedBy, offset }) => (
  <>
    <Rect
      width={size + 16}
      height={size + 16}
      offsetX={8}
      offsetY={8}
      stroke="deepskyblue"
      strokeWidth={3}
      dash={[4, 4]}
      cornerRadius={size / 2}
    />
    {selectedBy && (
      <Text
        text={selectedBy}
        fontSize={20}
        fill="deepskyblue"
        y={-offset}
        x={-offset - 40}
        width={200}
        align="center"
      />
    )}
  </>
);

export default ExternalSelection;
