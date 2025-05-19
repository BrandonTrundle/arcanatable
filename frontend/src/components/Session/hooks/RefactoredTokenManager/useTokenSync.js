export function useTokenSync({ onTokenUpdate, onTokenDelete }) {
  const handleTokenUpdate = (tokensSetter, updatedToken) => {
    tokensSetter((prev) =>
      prev.map((t) => (t.id === updatedToken.id ? updatedToken : t))
    );
    onTokenUpdate?.(updatedToken);
  };

  const handleTokenDelete = (tokensSetter, tokenId) => {
    tokensSetter((prev) => prev.filter((t) => t.id !== tokenId));
    onTokenDelete?.(tokenId);
  };

  return {
    handleTokenUpdate,
    handleTokenDelete,
  };
}
