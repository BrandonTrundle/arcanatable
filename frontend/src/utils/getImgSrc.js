export const getImgSrc = (url) => {
  if (!url) return null;
  try {
    return new URL(url).href;
  } catch {
    return `${import.meta.env.VITE_API_URL}${url}`;
  }
};
