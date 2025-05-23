import { useState } from "react";

export const useMeasurementState = () => {
  const [measureTarget, setMeasureTarget] = useState(null);
  const [broadcastEnabled, setBroadcastEnabled] = useState(false);
  const [measurementColor, setMeasurementColor] = useState("#ff0000");
  const [snapSetting, setSnapSetting] = useState("center");
  const [lockMeasurement, setLockMeasurement] = useState(false);
  const [remoteMeasurements, setRemoteMeasurements] = useState([]);
  const [lockedMeasurements, setLockedMeasurements] = useState([]);

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
    setRemoteMeasurements,
    lockedMeasurements,
    setLockedMeasurements,
  };
};
