import React from "react";
import { Text } from "react-konva";

const TokenLabel = ({ title, offset }) => (
  <Text
    text={title}
    fontSize={14}
    fill="white"
    stroke="white"
    strokeWidth={1}
    y={-offset + 100}
    x={-offset + 15}
    width={100}
    align="center"
  />
);

export default TokenLabel;
