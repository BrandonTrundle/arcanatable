import { useRef, useMemo } from "react";

export const useStageContext = (map, cellSize = 70) => {
  const stageRef = useRef();

  const gridDimensions = useMemo(() => {
    if (!map || !map.content) {
      return { width: 0, height: 0 };
    }

    const width = map.content.width * cellSize;
    const height = map.content.height * cellSize;
    return { width, height };
  }, [map?.content?.width, map?.content?.height, cellSize]);

  return {
    stageRef,
    cellSize,
    gridWidth: gridDimensions.width,
    gridHeight: gridDimensions.height,
  };
};
