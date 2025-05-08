import React, { useEffect, useState } from "react";
import "../../../styles/SessionStyles/SharedStyles/ChatBox.css";

const ChatBox = ({ socket, campaignId, username }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("chatMessage", (message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("chatMessage");
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = {
      campaignId,
      username,
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("Sending message:", message);
    socket.emit("chatMessage", message);
    setInput("");
  };

  return (
    <div className="chat-box">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="chat-empty">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="chat-message">
              <strong>{msg.username}:</strong> <span>{msg.text}</span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
