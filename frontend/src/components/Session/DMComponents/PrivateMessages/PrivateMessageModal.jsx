import React, { useEffect, useState, useContext, useRef } from "react";
import { getApiUrl } from "../../../../utils/env";
import { UserContext } from "../../../../context/UserContext";

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
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
    <div
      style={{
        position: "fixed",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "600px",
        height: "500px",
        backgroundColor: "#222",
        color: "white",
        borderRadius: "10px",
        boxShadow: "0 0 20px rgba(0,0,0,0.6)",
        zIndex: 4000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "#333",
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #444",
        }}
      >
        <strong>🗨️ Private Chat with {player.username}</strong>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ✖
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: "180px",
            borderRight: "1px solid #444",
            padding: "8px",
            overflowY: "auto",
          }}
        >
          <p style={{ opacity: 0.7 }}>🗂️ Threads (coming soon)</p>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "8px",
            minHeight: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#111",
              borderRadius: "6px",
              marginBottom: "8px",
              padding: "8px",
              overflowY: "auto",
              height: "100%",
              minHeight: 0,
            }}
          >
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
                  <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                    {msg.from?.username || "You"}
                  </div>
                  <div>{msg.content}</div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ opacity: 0.5 }}>No messages yet</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #555",
                background: "#222",
                color: "white",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                background: "#4caf50",
                border: "none",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateMessageModal;
