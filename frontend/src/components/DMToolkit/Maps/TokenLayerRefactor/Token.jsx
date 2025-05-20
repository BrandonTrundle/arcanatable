import React, { memo } from "react";
import { Group, Rect, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import HPOverlay from "./visuals/HPOverlay";
import SelectionHighlight from "./visuals/SelectionHighlight";
import ExternalSelection from "./visuals/ExternalSelection";
import TokenLabel from "./visuals/TokenLabel";

const Token = ({
  id,
  x,
  y,
  imageUrl,
  title,
  size = "Medium",
  layer,
  activeLayer,
  onDragEnd,
  onRightClick,
  onClick,
  draggable,
  isSelected,
  isExternallySelected,
  selectedBy,
  isCombatMode,
  showTokenInfo,
  currentHP,
  maxHP,
}) => {
  // console.log("🔄 Token rendered:", id, currentHP);
  const [img] = useImage(
    imageUrl?.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL}${imageUrl}`
      : imageUrl,
    "anonymous"
  );

  if (!img) return null;

  const isDM = activeLayer === "dm";
  const isPlayerToken = layer === "player";
  const opacity = isDM ? (isPlayerToken ? 1 : 0.3) : 1;

  const sizeScaleMap = {
    Tiny: 0.5,
    Small: 1,
    Medium: 1,
    Large: 2,
    Huge: 3,
    Gargantuan: 4,
  };

  const scaleFactor = sizeScaleMap[size] || 1;
  const baseSize = 64;
  const visualSize = baseSize * scaleFactor;
  const offset = visualSize / 2;

  return (
    <Group
      x={x}
      y={y}
      offsetX={offset}
      offsetY={offset}
      opacity={opacity}
      draggable={draggable}
      dragBoundFunc={(pos) => pos}
      onDragEnd={(e) => {
        if (!draggable) return;
        const { x, y } = e.target.position();
        onDragEnd(id, x, y);
      }}
      onContextMenu={(e) => onRightClick?.(e, id)}
      onClick={(e) => onClick?.(e, id)}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
      title={title || id}
    >
      {isExternallySelected && (
        <ExternalSelection
          size={visualSize}
          selectedBy={selectedBy}
          offset={offset}
        />
      )}

      {isSelected && <SelectionHighlight size={visualSize} />}

      <Rect
        width={visualSize}
        height={visualSize}
        cornerRadius={visualSize / 2}
        stroke="saddlebrown"
        strokeWidth={2}
        fill="antiquewhite"
      />

      <KonvaImage
        image={img}
        width={visualSize}
        height={visualSize}
        cornerRadius={visualSize / 2}
      />

      {(isCombatMode || showTokenInfo) && title && (
        <TokenLabel title={title} offset={offset} />
      )}
    </Group>
  );
};

const areEqual = (prev, next) =>
  prev.id === next.id &&
  prev.x === next.x &&
  prev.y === next.y &&
  prev.currentHP === next.currentHP &&
  prev.maxHP === next.maxHP &&
  prev.isSelected === next.isSelected &&
  prev.title === next.title &&
  prev.imageUrl === next.imageUrl &&
  prev.layer === next.layer &&
  prev.size === next.size &&
  prev.isExternallySelected === next.isExternallySelected &&
  prev.selectedBy === next.selectedBy &&
  prev.draggable === next.draggable &&
  prev.isCombatMode === next.isCombatMode &&
  prev.showTokenInfo === next.showTokenInfo;

export default memo(Token, areEqual);
