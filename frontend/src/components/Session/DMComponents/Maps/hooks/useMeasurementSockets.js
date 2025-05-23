import { useEffect } from "react";

export const useMeasurementSockets = ({
  socket,
  userId,
  setRemoteMeasurements,
  setLockedMeasurements,
}) => {
  useEffect(() => {
    console.log("[SOCKET] useMeasurementSockets invoked with:", {
      socketExists: !!socket,
      userId,
    });

    if (!socket) return;

    const handleIncomingMeasurement = (data) => {
      if (data.userId !== userId) {
        setRemoteMeasurements((prev) => {
          const others = prev.filter((m) => m.userId !== data.userId);
          return [...others, data];
        });
      }
    };

    const handleClearMyMeasurement = ({ userId }) => {
      console.log("[SOCKET] Received measurement:clearMy for userId", userId);

      setRemoteMeasurements((prev) => {
        console.log("[SOCKET] Remote measurements before clear:", prev);
        const updated = prev.filter((m) => m.userId !== userId);
        console.log("[SOCKET] Remote measurements after clear:", updated);
        return updated;
      });
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
    socket.on("measurement:clearAll", () => {
      setLockedMeasurements([]);
      setRemoteMeasurements([]); // ✅ This is the key addition
    });
    socket.on("measurement:clearMy", handleClearMyMeasurement);
    socket.on("measurement:clearMy", (payload) => {
      console.log("[SOCKET] clearMy triggered with payload:", payload);
      handleClearMyMeasurement(payload);
    });

    return () => {
      socket.off("measurement:receive", handleIncomingMeasurement);
      socket.off("measurement:clear", handleClearMeasurement);
      socket.off("measurement:lock", handleLockMeasurement);
      socket.off("measurement:clearLocked", handleClearLocked);
      socket.off("measurement:clearAll", handleClearAllLocked);
      socket.off("measurement:clearMy", handleClearMyMeasurement);
    };
  }, [socket, userId, setRemoteMeasurements, setLockedMeasurements]);
};
