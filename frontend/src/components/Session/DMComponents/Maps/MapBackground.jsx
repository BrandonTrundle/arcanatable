import useImage from "use-image";
import { Layer, Rect, Image as KonvaImage } from "react-konva";
import GridOverlay from "../../../DMToolkit/Maps/GridOverlay";
import React, { useEffect } from "react";

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
  const [image] = useImage(
    imageUrl?.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL}${imageUrl}`
      : imageUrl,
    "anonymous"
  );

  useEffect(() => {
    console.log("[🗺️ MapBackground] imageUrl:", imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    if (image) {
      console.log("[🖼️ MapBackground] Loaded image:", {
        width: image.width,
        height: image.height,
      });
    }
  }, [image]);

  const shouldRenderImage = image && image.width > 0 && image.height > 0;
  const shouldRenderGrid = gridWidth > 0 && gridHeight > 0;

  return (
    <>
      {/* Background Image + Click Detection Layer */}
      <Layer>
        {shouldRenderImage ? (
          <>
            <KonvaImage image={image} width={gridWidth} height={gridHeight} />
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

                onMapClick?.({ trueX, trueY });
              }}
            />
          </>
        ) : (
          <Rect
            width={gridWidth}
            height={gridHeight}
            fill="darkslategray"
            listening={false}
          />
        )}
      </Layer>

      {/* Grid Layer */}
      {shouldRenderGrid && (
        <Layer>
          <GridOverlay
            width={parseInt(mapWidth, 10)}
            height={parseInt(mapHeight, 10)}
            cellSize={cellSize}
            lineOpacity={gridVisible ? 0.5 : 0}
          />
        </Layer>
      )}
    </>
  );
};

export default MapBackground;
