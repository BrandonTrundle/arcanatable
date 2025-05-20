import React, { memo } from "react";
import Token from "../../DMToolkit/Maps/TokenLayerRefactor/Token";

const TokenLayer = ({
  tokens,
  onDragEnd,
  onRightClick,
  isCombatMode,
  onClick,
  selectedTokenId,
  activeLayer,
  canMove = () => true,
  externalSelections = {},
  isInteractive = true,
  showTokenInfo = false,
}) => {
  return (
    <>
      {tokens.map((token) => {
        const draggable =
          typeof canMove === "function" ? canMove(token) : !!canMove;

        return (
          <Token
            key={token.id}
            id={token.id}
            x={token.x}
            y={token.y}
            imageUrl={token.imageUrl}
            title={token.name}
            size={token.tokenSize}
            layer={token.layer}
            activeLayer={activeLayer}
            currentHP={token.currentHP}
            maxHP={token.maxHP}
            isCombatMode={isCombatMode}
            showTokenInfo={showTokenInfo}
            onDragEnd={onDragEnd}
            onClick={(e) => {
              if (isInteractive) onClick(e, token.id);
            }}
            onRightClick={(e) => {
              if (isInteractive) onRightClick(e, token.id);
            }}
            draggable={isInteractive && draggable}
            isSelected={selectedTokenId === token.id}
            isExternallySelected={!!externalSelections[token.id]}
            selectedBy={externalSelections[token.id]?.username}
          />
        );
      })}
    </>
  );
};

export default memo(TokenLayer);
