export const saveTokenStateToBackend = async (map, tokens) => {
  if (!map?._id || !tokens || !Array.isArray(tokens)) return;

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/dmtoolkit/${map._id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            ...map.content,
            placedTokens: tokens,
          },
        }),
      }
    );

    if (!res.ok) {
      console.error("❌ Failed to save tokens to backend.");
    } else {
      //   console.log("✅ Token state successfully saved.");
    }
  } catch (err) {
    console.error("🚫 Error saving token state:", err);
  }
};
