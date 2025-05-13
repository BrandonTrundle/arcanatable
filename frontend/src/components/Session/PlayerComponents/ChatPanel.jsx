import React from "react";
import ChatBox from "../SharedComponents/ChatBox";

const ChatPanel = ({ socket, campaignId, username, userId }) => {
  return (
    <aside className="dm-chat-panel">
      <ChatBox
        socket={socket}
        campaignId={campaignId}
        username={username}
        userId={userId}
      />
    </aside>
  );
};

export default ChatPanel;
