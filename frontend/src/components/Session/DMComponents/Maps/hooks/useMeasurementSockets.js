import { useEffect } from "react";

export const useMeasurementSockets = ({
  socket,
  userId,
  setRemoteMeasurements,
  setLockedMeasurements,
}) => {
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMeasurement = (data) => {
      if (data.userId !== userId) {
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
      if (data.userId !== userId) {
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
  }, [socket, userId, setRemoteMeasurements, setLockedMeasurements]);
};
