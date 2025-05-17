import React from "react";
import Navbar from "../components/Auth/Navbar";

const Community = () => {
  return (
    <>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h1>Community Hub</h1>
        <p>
          Welcome to the ArcanaTable Community! This will become the central
          place to discuss game systems, share custom content, and interact with
          other players.
        </p>

        <ul style={{ marginTop: "1rem" }}>
          <li>💬 Forums (Coming Soon)</li>
          <li>📚 Module Sharing & Feedback</li>
          <li>🧵 Campaign Journals / Actual Play Threads</li>
          <li>🛠 Bug Reports & Feature Requests</li>
          <li>📣 Announcements</li>
        </ul>
      </div>
    </>
  );
};

export default Community;
