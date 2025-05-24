import { useRef } from "react";

export const useDebouncedTokenSave = () => {
  const timeoutRef = useRef(null);

  const save = (mapId, content) => {
    //   console.log("[useDebouncedTokenSave] Save triggered", { mapId, content });

    if (!mapId || !content) {
      console.warn("[useDebouncedTokenSave] Invalid mapId or content", {
        mapId,
        content,
      });
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      //     console.log("[useDebouncedTokenSave] Cleared previous timeout");
    }

    timeoutRef.current = setTimeout(() => {
      //   console.log("[useDebouncedTokenSave] Executing debounced save");

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

  return save;
};
