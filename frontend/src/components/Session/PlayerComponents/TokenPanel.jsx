import React from "react";
import PlayerTokenManager from "./Tokens/PlayerTokenManager";

const TokenPanel = ({ campaignId, userToken, onClose }) => {
  return (
    <div className="player-token-panel">
      <PlayerTokenManager
        campaignId={campaignId}
        userToken={userToken}
        onClose={onClose}
      />
    </div>
  );
};

export default TokenPanel;
