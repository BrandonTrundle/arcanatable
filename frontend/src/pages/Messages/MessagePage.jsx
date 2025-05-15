import React, { useEffect, useState } from "react";
import axios from "axios";
import ComposeMessageModal from "../../components/Modal/ComposeMessageModal";
import "../../styles/MessagePage.css";
import courierBg from "../../assets/ElvenCourier.png";

const MessagePage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [userId, setUserId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("inbox");

  const [sidebarWidth, setSidebarWidth] = useState(30);
  const [isResizing, setIsResizing] = useState(false);

  const fetchMessages = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/messages`;
      if (viewMode === "sent")
        url = `${import.meta.env.VITE_API_URL}/api/messages/sent`;
      else if (viewMode === "trash")
        url = `${import.meta.env.VITE_API_URL}/api/messages`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUserId(res.data._id);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) fetchMessages();
  }, [viewMode, userId]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        setSidebarWidth(Math.min(50, Math.max(15, newWidth)));
      }
    };
    const stopResizing = () => setIsResizing(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  const handleSelect = async (msg) => {
    setSelectedMessage(msg);

    if (viewMode === "inbox" && !msg.readBy.includes(userId)) {
      try {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/messages/${msg._id}/read`,
          null,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setMessages((prev) =>
          prev.map((m) =>
            m._id === msg._id ? { ...m, readBy: [...m.readBy, userId] } : m
          )
        );
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  const handleArchive = async () => {
    if (!selectedMessage) return;

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/messages/${
          selectedMessage._id
        }/archive`,
        null,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      fetchMessages();
      setSelectedMessage(null);
    } catch (err) {
      console.error("Failed to archive message", err);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedMessage) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/messages/${selectedMessage._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      fetchMessages();
      setSelectedMessage(null);
    } catch (err) {
      console.error("Failed to permanently delete message", err);
    }
  };

  const visibleMessages = messages
    .filter((msg) => {
      if (!userId) return false;

      if (viewMode === "inbox") {
        return (
          msg.recipientIds.some((r) => r._id === userId || r === userId) &&
          !msg.archivedBy.includes(userId)
        );
      }

      if (viewMode === "sent") {
        return msg.senderId._id === userId || msg.senderId === userId;
      }

      if (viewMode === "trash") {
        return msg.archivedBy.includes(userId);
      }

      return false;
    })
    .filter((msg) => filter === "all" || msg.category === filter);

  return (
    <div
      className="message-page"
      style={{
        backgroundImage: `url(${courierBg})`,
        backgroundSize: "60%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      }}
    >
      <div className="message-container">
        <div className="message-sidebar" style={{ width: `${sidebarWidth}%` }}>
          <h2>
            {viewMode === "sent"
              ? "📤 Sent"
              : viewMode === "trash"
              ? "🗑️ Trash"
              : "📜 Inbox"}
          </h2>

          {viewMode !== "sent" && (
            <div className="message-filters">
              <button
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={filter === "personal" ? "active" : ""}
                onClick={() => setFilter("personal")}
              >
                Personal
              </button>
            </div>
          )}

          <button onClick={() => setShowComposer(true)}>✍️ Compose</button>

          <div className="message-scroll-list">
            {visibleMessages.map((msg) => (
              <div
                key={msg._id}
                className={`message-list-item ${
                  selectedMessage?._id === msg._id ? "active" : ""
                } ${!msg.readBy?.includes(userId) ? "unread" : ""}`}
                onClick={() => handleSelect(msg)}
              >
                <strong>
                  {viewMode === "sent"
                    ? msg.recipientIds.map((r) => r.username).join(", ")
                    : msg.senderId.username}
                </strong>
                <p className="message-subject">{msg.subject}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="resizer" onMouseDown={() => setIsResizing(true)}></div>

        <div className={`message-viewer ${selectedMessage ? "visible" : ""}`}>
          {selectedMessage ? (
            <div key={selectedMessage._id} className="fade-in">
              <h3>{selectedMessage.subject}</h3>
              <p>
                <em>
                  {viewMode === "sent"
                    ? `To: ${selectedMessage.recipientIds
                        .map((r) => r.username)
                        .join(", ")}`
                    : `From: ${selectedMessage.senderId.username}`}
                </em>
              </p>
              <p className="message-body">{selectedMessage.body}</p>
              <div className="action-buttons">
                {viewMode !== "sent" && (
                  <button
                    onClick={() => {
                      setReplyTo(selectedMessage);
                      setShowComposer(true);
                    }}
                  >
                    📩 Reply
                  </button>
                )}
                {viewMode !== "trash" && (
                  <button onClick={handleArchive}>🗂 Archive</button>
                )}
                {viewMode === "trash" && (
                  <button onClick={handlePermanentDelete}>
                    🗑️ Delete Forever
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p>Select a message to read it.</p>
          )}
        </div>

        <div className="message-actions-bar">
          <button title="Inbox" onClick={() => setViewMode("inbox")}>
            📨
          </button>
          <button title="Sent" onClick={() => setViewMode("sent")}>
            📤
          </button>
          <button title="Trash" onClick={() => setViewMode("trash")}>
            🗑️
          </button>
        </div>
      </div>

      {showComposer && (
        <ComposeMessageModal
          onClose={() => {
            setShowComposer(false);
            setReplyTo(null);
          }}
          onSent={() => {
            fetchMessages();
            setShowComposer(false);
            setReplyTo(null);
          }}
          replyTo={replyTo}
        />
      )}
    </div>
  );
};

export default MessagePage;
