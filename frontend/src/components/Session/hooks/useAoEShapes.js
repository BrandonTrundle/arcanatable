import { useState, useCallback, useEffect } from "react";

export const useAoEShapes = (mapId, socket, campaignId) => {
  const [aoeShapes, setAoEShapes] = useState({});

  const addAoEShape = useCallback(
    (shape) => {
      setAoEShapes((prev) => {
        const updated = {
          ...prev,
          [mapId]: [...(prev[mapId] || []), shape],
        };
        return updated;
      });
    },
    [mapId]
  );

  const removeAoEShape = useCallback(
    (id, { silent = false } = {}) => {
      setAoEShapes((prev) => {
        const updated = {
          ...prev,
          [mapId]: (prev[mapId] || []).filter((shape) => shape.id !== id),
        };

        if (!silent && socket) {
          //   console.log("📤 Emitting aoeRemoved:", {
          //    mapId,
          //     aoeId: id,
          //     campaignId,
          //    });
          socket.emit("aoeRemoved", {
            mapId,
            aoeId: id,
            campaignId,
          });
        }

        return updated;
      });
    },
    [mapId, socket, campaignId]
  );

  useEffect(() => {
    if (!socket) return;

    const handleRemoteAdd = ({ mapId: incomingMapId, aoe }) => {
      setAoEShapes((prev) => {
        const updated = {
          ...prev,
          [incomingMapId]: [...(prev[incomingMapId] || []), aoe],
        };
        return updated;
      });
    };

    const handleRemoteRemove = ({ mapId: incomingMapId, aoeId }) => {
      setAoEShapes((prev) => {
        const updated = {
          ...prev,
          [incomingMapId]: (prev[incomingMapId] || []).filter(
            (shape) => shape.id !== aoeId
          ),
        };
        return updated;
      });
    };

    socket.on("aoePlaced", handleRemoteAdd);
    socket.on("aoeRemoved", handleRemoteRemove);

    return () => {
      socket.off("aoePlaced", handleRemoteAdd);
      socket.off("aoeRemoved", handleRemoteRemove);
    };
  }, [socket]);

  return {
    aoeShapes,
    addAoEShape,
    removeAoEShape,
  };
};
