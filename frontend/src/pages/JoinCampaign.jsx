import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Auth/Navbar";
import "../styles/JoinCampaign.css";

const JoinCampaign = () => {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setJoining(true);

    try {
      const response = await fetch("/api/campaigns/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to join campaign");
      }

      navigate("/campaigns");
    } catch (err) {
      setError(err.message);
      setJoining(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="join-campaign-container">
        <h1>Join a Campaign</h1>
        <form onSubmit={handleSubmit} className="join-campaign-form">
          <label>
            Invite Code:
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              placeholder="Paste invite code here..."
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={joining}>
            {joining ? "Joining..." : "Join Campaign"}
          </button>
        </form>
      </div>
    </>
  );
};

export default JoinCampaign;
