import { useCallback } from "react";
import useMeasurementManager from "./useMeasurementManager";

export const useMeasurementInteraction = ({
  map,
  socket,
  user,
  selectedToken,
  selectedTokenId,
  activeInteractionMode,
}) => {
  const {
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
  } = useMeasurementManager({
    map,
    socket,
    user,
    selectedTokenId,
    selectedToken,
  });

  const handleMapClick = useCallback(() => {
    if (activeInteractionMode !== "measure") return;

    if (
      lockMeasurement &&
      broadcastEnabled &&
      selectedToken &&
      selectedTokenId &&
      measureTarget
    ) {
      const locked = {
        userId: user._id,
        from: { x: selectedToken.x, y: selectedToken.y },
        to: measureTarget,
        color: measurementColor,
      };

      socket.emit("measurement:lock", {
        mapId: map._id,
        ...locked,
      });

      setLockedMeasurements((prev) => [...prev, locked]);
    }

    setMeasureTarget(null);
  }, [
    activeInteractionMode,
    lockMeasurement,
    broadcastEnabled,
    selectedToken,
    selectedTokenId,
    measureTarget,
    measurementColor,
    socket,
    map?._id,
    user?._id,
    setLockedMeasurements,
    setMeasureTarget,
  ]);

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
    handleMapClick,
  };
};
