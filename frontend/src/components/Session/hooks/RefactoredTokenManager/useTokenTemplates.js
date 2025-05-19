import { useEffect, useState } from "react";

export const useTokenTemplates = (user) => {
  const [tokenTemplates, setTokenTemplates] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      console.log("[useTokenTemplates] Fetching token templates");

      try {
        const [allTokensRes, npcsRes, monstersRes] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_URL}/api/dmtoolkit/type/AllTokens`,
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          ),
          fetch(`${import.meta.env.VITE_API_URL}/api/dmtoolkit/type/NPC`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/dmtoolkit/type/Monster`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        const [allTokens, npcs, monsters] = await Promise.all([
          allTokensRes.json(),
          npcsRes.json(),
          monstersRes.json(),
        ]);

        const combined = [...npcs, ...monsters, ...allTokens].map((entry) => ({
          id: entry._id,
          type: entry.type || "custom",
          content: entry.content || {},
          title: entry.title || entry.content?.name || "Unnamed",
        }));

        console.log("[useTokenTemplates] Loaded templates:", combined);

        setTokenTemplates(combined);
      } catch (err) {
        console.error(
          "❌ [useTokenTemplates] Failed to load token templates:",
          err
        );
      }
    };

    fetchTemplates();
  }, [user.token]);

  return tokenTemplates;
};
