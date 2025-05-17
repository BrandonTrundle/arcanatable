import React, { useRef, useState, useEffect } from "react";
import "../../styles/UserInfoCard.css"; // Adjust if this is now under /styles/
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/defaultav.png";
import { UserContext } from "../../context/UserContext";
import { getApiUrl } from "../../utils/env";

const UserInfoCard = ({
  user,
  memberSince,
  hoursPlayed,
  hasUnseenNotifications = false,
  hasUnseenMessages = false,
}) => {
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || defaultAvatar);
  const [showMessages, setShowMessages] = useState(false);
  const navigate = useNavigate();
  const [simulatedHours, setSimulatedHours] = useState(user?.hoursPlayed || 0);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file); // ✅ MUST be "image"

    try {
      const token = localStorage.getItem("token");

      // 1. Upload to Supabase via shared route
      const uploadRes = await fetch(`${getApiUrl()}/api/uploads/avatars`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error("[Avatar Upload] Upload failed:", errText);
        throw new Error("Failed to upload avatar");
      }

      const { url } = await uploadRes.json();

      // 2. Save avatarUrl to user model
      const saveRes = await fetch(`${getApiUrl()}/api/users/avatarUrl`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarUrl: url }),
      });

      if (!saveRes.ok) {
        const errText = await saveRes.text();
        console.error("[Avatar Save] Failed:", errText);
        throw new Error("Failed to save avatar");
      }

      // 3. Update locally
      setAvatarUrl(url);
    } catch (err) {
      console.error("[Avatar Upload] Failed:", err);
      alert("Avatar upload failed.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedHours((prev) => prev + 0.001); // roughly every 3.6 seconds = 1 second of play
    }, 1000); // 1 second interval

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="user-info-card">
        <img
          src={
            avatarUrl?.startsWith("/uploads")
              ? `${getApiUrl()}${avatarUrl}`
              : avatarUrl
          }
          alt="User Avatar"
          onClick={handleAvatarClick}
          onError={() => setAvatarUrl(defaultAvatar)}
          className="user-avatar"
        />
        <input
          type="file"
          name="avatar"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="user-details">
          <h3 className="user-name">{user?.username || "Adventurer"}</h3>
          <p className="user-subscription">
            Tier: {user?.subscriptionTier || "Free"}
          </p>
          <p className="user-date">
            Member since:{" "}
            {memberSince ? new Date(memberSince).toLocaleDateString() : "N/A"}
          </p>
          <p className="user-hours">
            Hours Played:{" "}
            {(() => {
              const totalHours = user?.hoursPlayed ?? 0;
              const hours = Math.floor(totalHours);
              const minutes = Math.round((totalHours % 1) * 60);
              return `${hours} hr${hours !== 1 ? "s" : ""} ${minutes} min${
                minutes !== 1 ? "s" : ""
              }`;
            })()}
          </p>

          <button
            className="manage-account-btn"
            onClick={() => navigate("/account")}
          >
            Manage Account
          </button>

          <div className="user-actions">
            {/* Notifications icon (no routing assigned yet) */}
            <div className="action-item">
              <svg
                className={`icon ${hasUnseenNotifications ? "ringing" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C10.35 2 9 3.35 9 5v1.29c-2.84.48-5 2.94-5 5.86v3l-2 2v1h18v-1l-2-2v-3c0-2.92-2.16-5.38-5-5.86V5c0-1.65-1.35-3-3-3zM12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
              </svg>
              <span>Notifications</span>
            </div>

            {/* Messages icon with routing */}
            <div className="action-item" onClick={() => navigate("/messages")}>
              <svg
                className={`icon ${hasUnseenMessages ? "ringing" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>Messages</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserInfoCard;
