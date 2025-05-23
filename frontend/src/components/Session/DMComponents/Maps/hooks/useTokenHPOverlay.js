import { useMemo } from "react";

export const useTokenHPOverlay = (tokens, combatState) => {
  return useMemo(() => {
    return tokens
      .filter((token) => token.layer === "player")
      .map((token) => {
        const combatant = combatState?.combatants?.find(
          (c) => c.tokenId === token.id
        );

        return {
          ...token,
          currentHP: combatant?.currentHP ?? token.currentHP,
          maxHP: combatant?.maxHP ?? token.maxHP,
        };
      });
  }, [tokens, combatState]);
};
