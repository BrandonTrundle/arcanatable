import React, { memo, useState } from "react";
import { getApiUrl } from "../../../../utils/env";
import "../../../../styles/SessionStyles/DMStyles/DMConnectedPlayerCards.css";

const CARD_WIDTH = 160;

const DMConnectedPlayerCards = memo(
  ({ players, onSendMessage, currentUserId }) => {
    const [positions, setPositions] = useState({});
    const [collapsedStates, setCollapsedStates] = useState({});
    const [dragging, setDragging] = useState(null);

    const handleMouseDown = (e, playerId) => {
      const startX = e.clientX;
      const startY = e.clientY;

      const initPos = positions[playerId] || { x: 10, y: 10 };

      const onMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        setPositions((prev) => {
          const updated = {
            ...prev,
            [playerId]: {
              x: initPos.x + dx,
              y: initPos.y + dy,
            },
          };
          return updated;
        });
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
                  player.avatarUrl
                    ? player.avatarUrl.startsWith("/uploads")
                      ? `${getApiUrl()}${player.avatarUrl}`
                      : player.avatarUrl
                    : "/default-avatar.png"
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
                <button onClick={() => onSendMessage(player)}>
                  💬 Message {player.username}
                </button>
              )}
            </div>
          );
        })}
      </>
    );
  }
);

export default DMConnectedPlayerCards;
