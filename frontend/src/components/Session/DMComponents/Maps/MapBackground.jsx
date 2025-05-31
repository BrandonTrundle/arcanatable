import React from "react";
import useImage from "use-image";
import { Layer, Rect, Image as KonvaImage } from "react-konva";
import GridOverlay from "../../../DMToolkit/Maps/GridOverlay";

const MapBackground = ({
  imageUrl,
  gridWidth,
  gridHeight,
  cellSize,
  mapWidth,
  mapHeight,
  onMapClick,
  gridVisible, // ✅ Controls opacity
}) => {
  console.log("🔍 Grid is visible?", gridVisible);
  const [image] = useImage(
    imageUrl?.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL}${imageUrl}`
      : imageUrl
  );

  return (
    <>
      {/* Background Image + Click Detection Layer */}
      <Layer>
        {image && (
          <KonvaImage image={image} width={gridWidth} height={gridHeight} />
        )}
        <Rect
          width={gridWidth}
          height={gridHeight}
          fill="rgba(0,0,0,0.01)"
          listening={true}
          onClick={(e) => {
            const stage = e.target.getStage();
            const pointerPos = stage.getPointerPosition();
            const scale = stage.scaleX();
            const stagePos = stage.position();

            const trueX = (pointerPos.x - stagePos.x) / scale;
            const trueY = (pointerPos.y - stagePos.y) / scale;

            onMapClick({ trueX, trueY });
          }}
        />
      </Layer>

      {/* Grid Layer */}
      <Layer>
        <GridOverlay
          width={parseInt(mapWidth, 10)}
          height={parseInt(mapHeight, 10)}
          cellSize={cellSize}
          lineOpacity={gridVisible ? 0.5 : 0} // ✅ Controlled opacity
        />
      </Layer>
    </>
  );
};

export default MapBackground;
