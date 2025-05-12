export const emitSelection = (socket, map, user, tokenId) => {
  const campaignId = map?.content?.campaign;
  const mapId = map?._id;
  const userId = user?._id;

  if (socket && mapId && userId && campaignId) {
    socket.emit("tokenSelected", {
      mapId,
      campaignId,
      tokenId,
      userId,
      username: user.username,
    });
  } else {
    console.warn("🚫 emitSelection called with missing socket/map/user");
  }
};

export const emitDeselection = (socket, map, user) => {
  if (socket && map?._id && user?._id) {
    socket.emit("tokenDeselected", {
      mapId: map._id,
      campaignId: map.content?.campaign,
      userId: user._id,
    });
  }
};
