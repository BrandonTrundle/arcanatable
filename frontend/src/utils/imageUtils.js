export const buildImageUrl = (path) => {
  if (!path) return null;

  return path.startsWith("/uploads")
    ? `${import.meta.env.VITE_API_URL}${path}`
    : path;
};
