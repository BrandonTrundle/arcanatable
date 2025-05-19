export function useTokenZIndexManager(tokens, setTokens) {
  const bringTokenToFront = (tokenId) => {
    setTokens((prev) =>
      prev.map((token) =>
        token.id === tokenId ? { ...token, zIndex: Date.now() } : token
      )
    );
  };

  return {
    bringTokenToFront,
  };
}
