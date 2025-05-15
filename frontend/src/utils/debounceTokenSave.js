let saveTimeout = null;

export const debounceTokenSave = (mapId, content) => {
  if (!mapId || !content) return;

  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/dmtoolkit/${mapId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    }).catch((err) => {
      console.error("❌ Debounced token save failed:", err);
    });
  }, 1000);
};
