import { useState, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";

const useMeasurementManager = ({
  map,
  socket,
  user,
  selectedTokenId,
  selectedToken,
}) => {
  const [measureTarget, setMeasureTarget] = useState(null);
  const [broadcastEnabled, setBroadcastEnabled] = useState(false);
  const [measurementColor, setMeasurementColor] = useState("#ff0000");
  const [snapSetting, setSnapSetting] = useState("center");
  const [lockMeasurement, setLockMeasurement] = useState(false);
  const [remoteMeasurements, setRemoteMeasurements] = useState([]);
  const [lockedMeasurements, setLockedMeasurements] = useState([]);

  const emitMeasurement = useCallback(
    throttle((to) => {
      if (
        broadcastEnabled &&
        socket &&
        map?._id &&
        selectedTokenId &&
        selectedToken
      ) {
        socket.emit("measurement:update", {
          mapId: map._id,
          userId: user._id,
          tokenId: selectedTokenId,
          from: { x: selectedToken.x, y: selectedToken.y },
          to,
        });
      }
    }, 100),
    [
      broadcastEnabled,
      socket,
      map?._id,
      user?._id,
      selectedTokenId,
      selectedToken,
    ]
  );

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMeasurement = (data) => {
      if (data.userId !== user._id) {
        setRemoteMeasurements((prev) => {
          const others = prev.filter((m) => m.userId !== data.userId);
          return [...others, data];
        });
      }
    };

    const handleClearMeasurement = ({ userId }) => {
      setRemoteMeasurements((prev) => prev.filter((m) => m.userId !== userId));
    };

    const handleLockMeasurement = (data) => {
      if (data.userId !== user._id) {
        setLockedMeasurements((prev) => [...prev, data]);
      }
    };

    const handleClearLocked = ({ userId }) => {
      setLockedMeasurements((prev) => prev.filter((m) => m.userId !== userId));
    };

    const handleClearAllLocked = () => {
      setLockedMeasurements([]);
    };

    socket.on("measurement:receive", handleIncomingMeasurement);
    socket.on("measurement:clear", handleClearMeasurement);
    socket.on("measurement:lock", handleLockMeasurement);
    socket.on("measurement:clearLocked", handleClearLocked);
    socket.on("measurement:clearAll", handleClearAllLocked);

    return () => {
      socket.off("measurement:receive", handleIncomingMeasurement);
      socket.off("measurement:clear", handleClearMeasurement);
      socket.off("measurement:lock", handleLockMeasurement);
      socket.off("measurement:clearLocked", handleClearLocked);
      socket.off("measurement:clearAll", handleClearAllLocked);
    };
  }, [socket, user._id]);

  return {
    measureTarget,
    setMeasureTarget,
    broadcastEnabled,
    setBroadcastEnabled,
    measurementColor,
    setMeasurementColor,
    snapSetting,
    setSnapSetting,
    lockMeasurement,
    setLockMeasurement,
    remoteMeasurements,
    lockedMeasurements,
    setLockedMeasurements,
    emitMeasurement,
  };
};

export default useMeasurementManager;
