import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export function useAOEManager(
  initialAoes = [],
  socket = null,
  campaignId = null,
  mapId = null
) {
  const [aoes, setAoes] = useState(initialAoes);

  const addAOE = useCallback(
    (aoeData) => {
      const newAOE = {
        id: uuidv4(),
        type: "circle",
        anchored: false,
        x: 0,
        y: 0,
        sourceTokenId: null,
        color: "rgba(255,0,0,0.4)",
        visibleTo: "all",
        ...aoeData,
      };

      setAoes((prev) => [...prev, newAOE]);

      if (socket && campaignId) {
        socket.emit("aoe:add", {
          campaignId,
          aoe: newAOE,
        });
        socket.emit("aoe:save", { campaignId, mapId, aoe: newAOE });
        console.log("[AOE] Emitting add:", newAOE);
      }

      return newAOE;
    },
    [socket, campaignId]
  );

  const updateAOE = useCallback(
    (id, updates) => {
      setAoes((prev) => {
        const updatedList = prev.map((aoe) =>
          aoe.id === id ? { ...aoe, ...updates } : aoe
        );

        const updatedAoE = updatedList.find((a) => a.id === id);

        // Emit changes after AoE is updated
        if (socket && campaignId) {
          socket.emit("aoe:update", {
            campaignId,
            id,
            updates,
          });

          if (mapId) {
            socket.emit("aoe:save", {
              campaignId,
              mapId,
              aoe: updatedAoE,
            });
          }
        }

        return updatedList;
      });
    },
    [socket, campaignId, mapId]
  );

  const removeAOE = useCallback(
    (id) => {
      setAoes((prev) => prev.filter((aoe) => aoe.id !== id));

      if (socket && campaignId) {
        socket.emit("aoe:remove", {
          campaignId,
          id,
        });
        socket.emit("aoe:delete", { campaignId, mapId, id });
        console.log("[AOE] Emitting remove:", id);
      }
    },
    [socket, campaignId]
  );

  // ⏬ Listen for incoming changes
  useEffect(() => {
    if (!socket || !campaignId) return;

    const handleAdd = (aoe) => {
      console.log("[AOE] Received add from socket:", aoe);
      setAoes((prev) => [...prev, aoe]);
    };

    const handleUpdate = ({ id, updates }) => {
      console.log("[AOE] Received update from socket:", id, updates);
      setAoes((prev) =>
        prev.map((aoe) => (aoe.id === id ? { ...aoe, ...updates } : aoe))
      );
    };

    const handleRemove = (id) => {
      console.log("[AOE] Received remove from socket:", id);
      setAoes((prev) => prev.filter((aoe) => aoe.id !== id));
    };

    socket.on("aoe:add", handleAdd);
    socket.on("aoe:update", handleUpdate);
    socket.on("aoe:remove", handleRemove);

    return () => {
      socket.off("aoe:add", handleAdd);
      socket.off("aoe:update", handleUpdate);
      socket.off("aoe:remove", handleRemove);
    };
  }, [socket, campaignId]);

  return {
    aoes,
    addAOE,
    updateAOE,
    removeAOE,
    setAoes, // ✅ add this
  };
}
