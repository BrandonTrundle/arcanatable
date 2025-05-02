import React, { useRef, useState } from 'react';
import '../styles/UserInfoCard.css'; // Adjust if this is now under /styles/

const UserInfoCard = ({
  user,
  memberSince,
  hoursPlayed,
  hasUnseenNotifications = false,
  hasUnseenMessages = false,
}) => {
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState('/defaultav.png');

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('Mock avatar selected:', file.name);
    setAvatarUrl(URL.createObjectURL(file));
  };

  return (
    <div className="user-info-card">
      <img
        src={avatarUrl}
        alt="User Avatar"
        onClick={handleAvatarClick}
        onError={() => setAvatarUrl('/defaultav.png')}
        className="user-avatar"
      />
      <input
        type="file"
        name="avatar"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="user-details">
        <h3 className="user-name">{user?.username || 'Adventurer'}</h3>
        <p className="user-subscription">Tier: {user?.subscriptionTier || 'Free'}</p>
        <p className="user-date">
          Member since:{' '}
          {memberSince ? new Date(memberSince).toLocaleDateString() : 'N/A'}
        </p>
        <p className="user-hours">Hours Played: {hoursPlayed ?? 0}</p>

        <button className="manage-account-btn">Manage Account</button>

        <div className="user-actions">
          <div className="action-item">
            <svg
              className={`icon ${hasUnseenNotifications ? 'ringing' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C10.35 2 9 3.35 9 5v1.29c-2.84.48-5 2.94-5 5.86v3l-2 2v1h18v-1l-2-2v-3c0-2.92-2.16-5.38-5-5.86V5c0-1.65-1.35-3-3-3zM12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
            </svg>
            <span>Notifications</span>
          </div>

          <div className="action-item">
            <svg
              className={`icon ${hasUnseenMessages ? 'ringing' : ''}`}
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
  );
};

export default UserInfoCard;
