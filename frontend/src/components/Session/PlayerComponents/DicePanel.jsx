import React from "react";
import DiceRoller from "../SharedComponents/DiceRoller"; // ✅ correct

const DicePanel = ({ userId, campaignId, username, socket }) => {
  return (
    <div className="dice-panel">
      <DiceRoller
        userId={userId}
        campaignId={campaignId}
        username={username}
        socket={socket}
      />
    </div>
  );
};

export default DicePanel;
