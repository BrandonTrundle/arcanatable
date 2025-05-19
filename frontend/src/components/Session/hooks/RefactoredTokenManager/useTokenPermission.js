import { useCallback } from "react";

export const useTokenPermission = (user, isDM) => {
  const hasControl = useCallback(
    (token) => {
      const canControl = isDM || (user && token.controller === user._id);
      //console.log("[useTokenPermission] hasControl?", {
      // tokenId: token?._id,
      // userId: user?._id,
      // isDM,
      // result: canControl,
      // });
      return canControl;
    },
    [user, isDM]
  );

  return hasControl;
};
