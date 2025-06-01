import React, { memo, useState, useRef } from "react";
import { getApiUrl } from "../../../../utils/env";
import "../../../../styles/SessionStyles/DMStyles/DMConnectedPlayerCards.css";
import PrivateMessageModal from "../PrivateMessages/PrivateMessageModal";

const CARD_WIDTH = 160;

const DMConnectedPlayerCards = memo(
  ({ players, onSendMessage, currentUserId, socket, user }) => {
    const [positions, setPositions] = useState({});
    const [collapsedStates, setCollapsedStates] = useState({});
    const [dragging, setDragging] = useState(null);
    const fileInputRef = useRef(null);
    const broadcastFileInputRef = useRef(null);
    const pendingTargetRef = useRef(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [selectedChatUser, setSelectedChatUser] = useState(null);

    const handleSendHandout = (player) => {
      pendingTargetRef.current = player;
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      const player = pendingTargetRef.current;
      if (!file || !player) return;

      const token = localStorage.getItem("token");
      if (file.size > 50 * 1024 * 1024) {
        alert("File too large! Max size is 50MB.");
        return;
      }
      const formData = new FormData();
      formData.append("file", file); // same field name as before

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          setUploadProgress(null); // reset

          if (xhr.status === 200) {
            const { url } = JSON.parse(xhr.responseText);

            socket.emit("handout:offer", {
              to: player.userId,
              from: { userId: currentUserId, username: user.username },
              filename: file.name,
              type: file.type,
              url,
            });

            fileInputRef.current.value = null;
            pendingTargetRef.current = null;
          } else {
            console.error("❌ Upload failed:", xhr.responseText);
            alert("File upload failed.");
          }
        }
      };

      xhr.open("POST", `${getApiUrl()}/api/uploads/handouts`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    };

    const handleBroadcastHandout = () => {
      if (broadcastFileInputRef.current) {
        broadcastFileInputRef.current.click();
      }
    };

    const handleBroadcastFileChange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file); // ✅ match multer field

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          setUploadProgress(null); // reset progress bar

          if (xhr.status === 200) {
            const { url } = JSON.parse(xhr.responseText);

            socket.emit("handout:broadcast", {
              from: { userId: currentUserId, username: user.username }, // ✅ include sender info
              filename: file.name,
              type: file.type,
              url,
            });

            broadcastFileInputRef.current.value = null;
          } else {
            console.error("❌ Broadcast upload failed:", xhr.responseText);
            alert("Broadcast upload failed.");
          }
        }
      };

      xhr.open("POST", `${getApiUrl()}/api/uploads/handouts`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    };

    const handleMouseDown = (e, playerId) => {
      const startX = e.clientX;
      const startY = e.clientY;
      const initPos = positions[playerId] || { x: 10, y: 10 };

      const onMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        setPositions((prev) => ({
          ...prev,
          [playerId]: { x: initPos.x + dx, y: initPos.y + dy },
        }));
      };

      const onMouseUp = () => {
        setDragging(null);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      setDragging(playerId);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    const toggleCollapse = (playerId) => {
      setCollapsedStates((prev) => ({
        ...prev,
        [playerId]: !prev[playerId],
      }));
    };

    if (!players?.length) return null;

    return (
      <>
        {players.map((player, index) => {
          const isMe = player.userId === currentUserId;
          const defaultX = 10 + index * (CARD_WIDTH + 10);
          const pos = positions[player.userId] || { x: defaultX, y: 10 };
          const isCollapsed = collapsedStates[player.userId];

          return (
            <div
              key={`player-${player.userId}`}
              className="dm-player-card"
              onMouseDown={(e) => handleMouseDown(e, player.userId)}
              style={{
                position: "absolute",
                top: pos.y,
                left: pos.x,
                cursor: dragging === player.userId ? "grabbing" : "grab",
                userSelect: "none",
                zIndex: 2000,
                width: `${CARD_WIDTH}px`,
              }}
            >
              <div
                className="card-header"
                style={{ width: "100%", textAlign: "right" }}
              >
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(player.userId);
                  }}
                >
                  {isCollapsed ? "▶" : "🔽"}
                </button>
              </div>

              <img
                src={
                  player.avatarUrl?.startsWith("/uploads")
                    ? `${getApiUrl()}${player.avatarUrl}`
                    : player.avatarUrl || "/default-avatar.png"
                }
                alt={`${player?.username || "Unknown"}'s avatar`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />

              <div
                className="username"
                style={{ textAlign: "center", fontSize: "0.9rem" }}
              >
                {player.username} {isMe && "(You)"}
              </div>

              {!isCollapsed && (
                <>
                  <button onClick={() => setSelectedChatUser(player)}>
                    💬 Message
                  </button>
                  <button onClick={() => handleSendHandout(player)}>
                    📎 Send Handout
                  </button>
                </>
              )}
            </div>
          );
        })}

        {uploadProgress !== null && (
          <div
            style={{
              position: "fixed",
              bottom: 30,
              left: "50%",
              transform: "translateX(-50%)",
              width: "300px",
              background: "#333",
              borderRadius: "6px",
              overflow: "hidden",
              boxShadow: "0 0 10px rgba(0,0,0,0.4)",
              zIndex: 3000,
            }}
          >
            <div
              style={{
                height: "10px",
                width: `${uploadProgress}%`,
                background: "#4caf50",
                transition: "width 0.3s ease",
              }}
            />
            <div
              style={{
                textAlign: "center",
                color: "white",
                fontSize: "12px",
                padding: "4px 0",
              }}
            >
              Uploading... {uploadProgress}%
            </div>
          </div>
        )}

        <button
          onClick={handleBroadcastHandout}
          style={{
            position: "absolute",
            bottom: 50,
            left: 200,
            zIndex: 3000,
            padding: "8px 12px",
            background: "#444",
            color: "white",
            border: "1px solid #888",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          📎 Share With All
        </button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="*/*"
          onChange={handleFileChange}
        />

        <input
          type="file"
          ref={broadcastFileInputRef}
          style={{ display: "none" }}
          accept="*/*"
          onChange={handleBroadcastFileChange}
        />

        {selectedChatUser && (
          <PrivateMessageModal
            player={selectedChatUser}
            socket={socket}
            onClose={() => setSelectedChatUser(null)}
          />
        )}
      </>
    );
  } // ← CLOSES the component function
); // ← CLOSES memo()

export default DMConnectedPlayerCards;
