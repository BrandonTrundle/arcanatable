import { useState } from "react";

export function useTokenLockManager() {
  const [lockedTokens, setLockedTokens] = useState([]);

  const toggleTokenLock = (tokenId) => {
    setLockedTokens((prev) =>
      prev.includes(tokenId)
        ? prev.filter((id) => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const isTokenLocked = (tokenId) => lockedTokens.includes(tokenId);

  return {
    lockedTokens,
    toggleTokenLock,
    isTokenLocked,
  };
}
