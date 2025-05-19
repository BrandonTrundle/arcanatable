import { useState } from "react";

export function useCameraFollow() {
  const [cameraFollow, setCameraFollow] = useState(null);

  const toggleCameraFollow = (tokenId) => {
    setCameraFollow((prev) => (prev === tokenId ? null : tokenId));
  };

  return {
    cameraFollow,
    toggleCameraFollow,
  };
}
