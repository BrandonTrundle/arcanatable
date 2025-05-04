import React from 'react';
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva';
import useImage from 'use-image';

const MapEditor = ({ map, onClose }) => {
  const [image] = useImage(map.content.imageUrl);

  const squaresX = map.content.width;
  const squaresY = map.content.height;

  const cellSize = 70; // You can make this dynamic later

  const gridWidth = squaresX * cellSize;
  const gridHeight = squaresY * cellSize;

  // Generate grid lines
  const verticalLines = Array.from({ length: squaresX + 1 }, (_, i) => (
    <Line
      key={`v-${i}`}
      points={[i * cellSize, 0, i * cellSize, gridHeight]}
      stroke="red"
      strokeWidth={1}
    />
  ));

  const horizontalLines = Array.from({ length: squaresY + 1 }, (_, i) => (
    <Line
      key={`h-${i}`}
      points={[0, i * cellSize, gridWidth, i * cellSize]}
      stroke="blue"
      strokeWidth={1}
    />
  ));

  return (
    <div className="map-editor-overlay">
      <button onClick={onClose} className="close-editor-btn">❌ Close Editor</button>

      <Stage width={gridWidth} height={gridHeight}>
        <Layer>
          {image && (
            <KonvaImage
              image={image}
              width={gridWidth}
              height={gridHeight}
            />
          )}
        </Layer>
        <Layer>
          {verticalLines}
          {horizontalLines}
        </Layer>
      </Stage>
    </div>
  );
};

export default MapEditor;
