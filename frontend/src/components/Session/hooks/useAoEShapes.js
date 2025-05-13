import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export const useAoEShapes = (mapId, socket = null) => {
  const [aoeShapes, setAoEShapes] = useState({});

  const addAoEShape = useCallback(
    (shape) => {
      const newShape = {
        ...shape,
        id: uuidv4(),
      };

      setAoEShapes((prev) => {
        const updated = {
          ...prev,
          [mapId]: [...(prev[mapId] || []), newShape],
        };

        if (socket) {
          socket.emit("aoe:add", { mapId, shape: newShape });
        }

        return updated;
      });
    },
    [mapId, socket]
  );

  const removeAoEShape = useCallback(
    (id) => {
      setAoEShapes((prev) => {
        const updated = {
          ...prev,
          [mapId]: (prev[mapId] || []).filter((shape) => shape.id !== id),
        };

        if (socket) {
          socket.emit("aoe:remove", { mapId, id });
        }

        return updated;
      });
    },
    [mapId, socket]
  );

  // 🔧 Add this useEffect for syncing with other clients
  useEffect(() => {
    if (!socket) return;

    const handleRemoteAdd = ({ mapId: incomingMapId, shape }) => {
      setAoEShapes((prev) => {
        const updated = {
          ...prev,
          [incomingMapId]: [...(prev[incomingMapId] || []), shape],
        };
        return updated;
      });
    };

    const handleRemoteRemove = ({ mapId: incomingMapId, id }) => {
      setAoEShapes((prev) => {
        const updated = {
          ...prev,
          [incomingMapId]: (prev[incomingMapId] || []).filter(
            (shape) => shape.id !== id
          ),
        };
        return updated;
      });
    };

    socket.on("aoe:add", handleRemoteAdd);
    socket.on("aoe:remove", handleRemoteRemove);

    return () => {
      socket.off("aoe:add", handleRemoteAdd);
      socket.off("aoe:remove", handleRemoteRemove);
    };
  }, [socket]);

  return {
    aoeShapes,
    addAoEShape,
    removeAoEShape,
  };
};
