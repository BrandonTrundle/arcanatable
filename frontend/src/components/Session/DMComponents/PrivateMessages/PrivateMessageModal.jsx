import React, { useEffect, useState, useContext, useRef } from "react";
import { getApiUrl } from "../../../../utils/env";
import { UserContext } from "../../../../context/UserContext";
import styles from "../../../../styles/SessionStyles/PrivateMessage/PrivateMessageModal.module.css";

const PrivateMessageModal = ({ player, socket, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const { user } = useContext(UserContext);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    pos.current = {
      x: e.clientX - modalRef.current.offsetLeft,
      y: e.clientY - modalRef.current.offsetTop,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    modalRef.current.style.left = `${e.clientX - pos.current.x}px`;
    modalRef.current.style.top = `${e.clientY - pos.current.y}px`;
    modalRef.current.style.right = "auto";
    modalRef.current.style.bottom = "auto";
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    const fetchThread = async () => {
      if (!player?.userId) {
        console.error("❌ No userId available to fetch thread");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${getApiUrl()}/api/messages/thread/${player.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setThread(data);
      } catch (err) {
        console.error("Error fetching message thread", err);
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [player.userId, token]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (msg) => {
      if (!msg || !msg.threadId || !msg.from) {
        console.warn("❌ Ignoring malformed incoming message:", msg);
        return;
      }

      if (
        thread &&
        msg.threadId === thread._id &&
        (msg.from._id === player.userId || msg.from._id === currentUserId)
      ) {
        setThread((prev) => ({
          ...prev,
          messages: [...(prev?.messages || []), msg],
        }));
      }
    };

    socket.on("private:message", handleIncomingMessage);
    return () => socket.off("private:message", handleIncomingMessage);
  }, [socket, thread, player.userId, currentUserId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [thread?.messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !thread) return;

    try {
      const res = await fetch(
        `${getApiUrl()}/api/messages/thread/${thread._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: messageInput }),
        }
      );

      if (res.ok) {
        const fullMessage = {
          from: { _id: user._id, username: user.username },
          content: messageInput,
          timestamp: new Date().toISOString(),
          threadId: thread._id,
          toUserId: player.userId,
        };

        console.log("📤 Emitting private message:", fullMessage);
        socket.emit("private:message", fullMessage);

        setMessageInput("");
      } else {
        console.warn("❌ Server failed to save message. Not emitting.");
      }
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  return (
    <div
      ref={modalRef}
      className={styles.modal}
      style={{
        position: "absolute",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <div className={styles.header} onMouseDown={handleMouseDown}>
        <strong>🗨️ Private Chat with {player.username}</strong>
        <div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={styles.collapseButton}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? "🔽" : "🔼"}
          </button>
          <button onClick={onClose} className={styles.closeButton}>
            ✖
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <div className={styles.threadSidebar}>
            <p style={{ opacity: 0.7 }}>🗂️ Threads (coming soon)</p>

            {thread && (
              <button
                className={styles.deleteButton}
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Are you sure you want to delete this conversation?"
                    )
                  )
                    return;
                  try {
                    const res = await fetch(
                      `${getApiUrl()}/api/messages/thread/${thread._id}`,
                      {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    if (res.ok) {
                      setThread(null);
                      setLoading(false);
                      alert("Conversation deleted.");
                    } else {
                      alert("Failed to delete.");
                    }
                  } catch (err) {
                    console.error("❌ Error deleting thread:", err);
                    alert("An error occurred.");
                  }
                }}
              >
                🗑️ Delete Conversation
              </button>
            )}
          </div>

          <div className={styles.mainArea}>
            <div className={styles.messageList}>
              {loading ? (
                <p style={{ opacity: 0.5 }}>Loading messages...</p>
              ) : thread?.messages?.length ? (
                thread.messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: "10px",
                      textAlign:
                        msg.from?._id === currentUserId ? "right" : "left",
                    }}
                  >
                    <div className={styles.messageMeta}>
                      {msg.from?.username || "You"}
                    </div>
                    <div>{msg.content}</div>
                    <div className={styles.messageTime}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ opacity: 0.5 }}>No messages yet</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputRow}>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                className={styles.textInput}
              />
              <button onClick={handleSendMessage} className={styles.sendButton}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateMessageModal;
