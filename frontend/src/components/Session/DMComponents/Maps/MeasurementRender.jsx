import React from "react";
import { Layer, Arrow, Text } from "react-konva";
import { calculateDistance } from "../Maps/hooks/mapUtils";

const MeasurementRender = ({
  activeInteractionMode,
  selectedToken,
  selectedTokenId,
  measureTarget,
  measurementColor,
  lockedMeasurements,
  remoteMeasurements,
  cellSize,
}) => {
  return (
    <>
      {/* 🔴 Local Measurement */}
      {activeInteractionMode === "measure" &&
        selectedToken &&
        selectedTokenId &&
        measureTarget && (
          <Layer>
            <Arrow
              points={[
                selectedToken.x,
                selectedToken.y,
                measureTarget.x,
                measureTarget.y,
              ]}
              stroke={measurementColor}
              fill={measurementColor}
              strokeWidth={2}
              pointerLength={10}
              pointerWidth={8}
              dash={[4, 4]}
            />
            <Text
              x={(selectedToken.x + measureTarget.x) / 2}
              y={(selectedToken.y + measureTarget.y) / 2 - 20}
              text={`${calculateDistance(
                { x: selectedToken.x, y: selectedToken.y },
                measureTarget,
                cellSize
              )} ft`}
              fontSize={16}
              fill={measurementColor}
              stroke="black"
              strokeWidth={0.5}
            />
          </Layer>
        )}

      {/* 🔒 Locked Measurements */}
      <Layer>
        {lockedMeasurements.map((m, i) => (
          <React.Fragment key={`locked-${m.userId}-${i}`}>
            <Arrow
              points={[m.from.x, m.from.y, m.to.x, m.to.y]}
              stroke={m.color || "#00bfff"}
              fill={m.color || "#00bfff"}
              strokeWidth={2}
              pointerLength={10}
              pointerWidth={8}
              dash={[4, 4]}
            />
            <Text
              x={(m.from.x + m.to.x) / 2}
              y={(m.from.y + m.to.y) / 2 - 20}
              text={`${calculateDistance(m.from, m.to, cellSize)} ft`}
              fontSize={16}
              fill="white"
              stroke="black"
              strokeWidth={0.5}
            />
          </React.Fragment>
        ))}
      </Layer>

      {/* 🔵 Remote Measurements */}
      {remoteMeasurements.map((m) => (
        <Layer key={m.userId}>
          <Arrow
            points={[m.from.x, m.from.y, m.to.x, m.to.y]}
            stroke="#00bfff"
            fill="#00bfff"
            strokeWidth={2}
            pointerLength={10}
            pointerWidth={8}
            dash={[4, 4]}
          />
          <Text
            x={(m.from.x + m.to.x) / 2}
            y={(m.from.y + m.to.y) / 2 - 20}
            text={`${calculateDistance(m.from, m.to, cellSize)} ft`}
            fontSize={16}
            fill="white"
            stroke="black"
            strokeWidth={0.5}
          />
        </Layer>
      ))}
    </>
  );
};

export default MeasurementRender;
