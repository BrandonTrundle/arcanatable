import React, { useState } from "react";
import DiceRoller from "../SharedComponents/DiceRoller";

const DicePanel = ({ userId, campaignId, username, socket, onClose }) => {
  const [showDice, setShowDice] = useState(true);

  if (!showDice) return null;

  const handleClose = () => {
    setShowDice(false);
    if (typeof onClose === "function") onClose();
  };

  return (
    <div className="dice-panel">
      <DiceRoller
        userId={userId}
        campaignId={campaignId}
        username={username}
        socket={socket}
        onClose={handleClose}
      />
    </div>
  );
};

export default DicePanel;
