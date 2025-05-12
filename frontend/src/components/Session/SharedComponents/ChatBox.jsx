import React, { useEffect, useState, useRef } from "react";
import "../../../styles/SessionStyles/SharedStyles/ChatBox.css";

const ChatBox = ({ socket, campaignId, username }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null); // NEW

  useEffect(() => {
    socket.on("chatMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("chatMessage");
    };
  }, [socket]);

  useEffect(() => {
    // SAFELY scroll only inside the container, not the full window
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = {
      campaignId,
      username,
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    socket.emit("chatMessage", message);
    setInput("");
  };

  return (
    <div className="chat-box">
      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <p className="chat-empty">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="chat-message">
              <strong className="chat-user-name">{msg.username}:</strong>{" "}
              <span className="chat-messages-text">{msg.text}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
          onFocus={(e) => {
            // Prevent layout jump
            requestAnimationFrame(() =>
              e.target.scrollIntoView({
                block: "nearest",
                inline: "nearest",
                behavior: "instant",
              })
            );
          }}
        />
        <button type="submit" className="chat-send-btn">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
