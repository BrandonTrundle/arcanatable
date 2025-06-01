import React, { useEffect, useState, useContext, useRef } from "react";
import { getApiUrl } from "../../../../utils/env";
import { UserContext } from "../../../../context/UserContext";
import styles from "../../../../styles/SessionStyles/PrivateMessage/PrivateMessageModal.module.css";

const PrivateMessageModal = ({ player, socket, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const { user } = useContext(UserContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchThread = async () => {
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

    const newMessage = {
      from: { _id: currentUserId, username: user.username },
      content: messageInput,
      timestamp: new Date().toISOString(),
      threadId: thread._id,
    };

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
        socket.emit("private:message", {
          toUserId: player.userId,
          message: newMessage,
        });

        setMessageInput("");
      }
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <strong>🗨️ Private Chat with {player.username}</strong>
        <button onClick={onClose} className={styles.closeButton}>
          ✖
        </button>
      </div>

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
    </div>
  );
};

export default PrivateMessageModal;
