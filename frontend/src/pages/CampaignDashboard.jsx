import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Auth/Navbar";
import backgroundImage from "../assets/Campaigns.png";
import defaultAvatar from "../assets/defaultav.png";
import placeholderImg from "../assets/FantasyMapBackground.png";
import "../styles/CampaignDashboard.css";

const CampaignDashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch("/api/campaigns", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        const list = Array.isArray(data) ? data : data.campaigns || [];
        setCampaigns(list);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchCampaigns();
    }
  }, [user]);

  const handleCreate = () => navigate("/campaigns/create");
  const handleJoin = () => navigate("/campaigns/join");

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?"))
      return;

    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
      } else {
        const err = await res.json();
        console.error("Failed to delete:", err.message);
      }
    } catch (err) {
      console.error("Error deleting campaign:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="campaign-dashboard"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "0% 25%",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          paddingTop: "10rem",
        }}
      >
        <div className="campaign-dashboard-content">
          <h1>Your Campaigns</h1>
          <div className="dashboard-actions">
            <button onClick={handleCreate} className="create-campaign-btn">
              Create New Campaign
            </button>
            <button onClick={handleJoin} className="join-campaign-btn">
              Join Campaign
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : campaigns.length > 0 ? (
            <ul className="campaign-list">
              {campaigns.map((campaign) => (
                <li key={campaign._id} className="campaign-card">
                  <img
                    src={campaign.imageUrl || placeholderImg}
                    alt={campaign.name}
                    className="campaign-image"
                    onError={(e) => (e.currentTarget.src = placeholderImg)}
                  />

                  <div className="campaign-role-label">
                    {campaign.creator === user._id ? (
                      <span className="dm-label">DM</span>
                    ) : (
                      <span className="player-label">Player</span>
                    )}
                  </div>

                  <div className="campaign-info">
                    <strong>{campaign.name}</strong> – {campaign.gameSystem}
                    <p className="invite-code">
                      Invite Code: {campaign.inviteCode}
                    </p>
                  </div>

                  <div className="campaign-avatars">
                    {campaign.players?.map((player) => (
                      <img
                        key={player._id}
                        src={player.avatarUrl || defaultAvatar}
                        alt={player.username}
                        title={`${player.username} – ${
                          player._id === campaign.creator ? "DM" : "Player"
                        }`}
                        className="campaign-avatar"
                        onError={(e) => (e.currentTarget.src = defaultAvatar)}
                      />
                    ))}
                  </div>

                  <div className="campaign-actions">
                    {campaign.creator === user._id ? (
                      <>
                        <button
                          onClick={() =>
                            navigate(`/campaigns/${campaign._id}/launch`)
                          }
                          className="launch-campaign-btn"
                        >
                          Launch Campaign
                        </button>
                        <button
                          onClick={() => handleDelete(campaign._id)}
                          className="delete-campaign-btn"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          navigate(`/campaigns/${campaign._id}/launch`)
                        }
                        className="join-campaign-btn"
                      >
                        Join Session
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No campaigns found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default CampaignDashboard;
