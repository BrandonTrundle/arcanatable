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
}) => {
  const [image] = useImage(
    imageUrl?.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL}${imageUrl}`
      : imageUrl
  );

  return (
    <>
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
            //console.log("📍 Rect clicked (background layer)");
            onMapClick(e);
          }}
        />
      </Layer>

      <Layer>
        <GridOverlay width={mapWidth} height={mapHeight} cellSize={cellSize} />
      </Layer>
    </>
  );
};

export default MapBackground;
