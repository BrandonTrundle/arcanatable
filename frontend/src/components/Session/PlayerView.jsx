import React, { useContext, useState } from "react";
import "../../styles/SessionStyles/DMStyles/DMView.css";
import "../../styles/SessionStyles/SharedStyles/ChatBox.css";
import Toolbar from "../Session/PlayerComponents/Toolbar";
import ChatBox from "../Session/SharedComponents/ChatBox";
import { UserContext } from "../../context/UserContext";

const PlayerView = ({ campaign, socket }) => {
  const { user } = useContext(UserContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="dm-session-container">
      <aside className={`dm-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <Toolbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </aside>

      <main className="dm-map-area">
        <div className="map-placeholder">
          <p>No map loaded yet.</p>
        </div>
      </main>

      <aside className="dm-chat-panel">
        <ChatBox
          socket={socket}
          campaignId={campaign._id}
          username={user.username}
        />
      </aside>
    </div>
  );
};

export default PlayerView;
