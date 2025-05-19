import { useState } from "react";

export function useSelectedTokens() {
  const [selectedTokens, setSelectedTokens] = useState([]);

  const toggleSelectedToken = (tokenId) => {
    setSelectedTokens((prev) =>
      prev.includes(tokenId)
        ? prev.filter((id) => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const clearSelectedTokens = () => setSelectedTokens([]);

  const isTokenSelected = (tokenId) => selectedTokens.includes(tokenId);

  return {
    selectedTokens,
    toggleSelectedToken,
    clearSelectedTokens,
    isTokenSelected,
  };
}
