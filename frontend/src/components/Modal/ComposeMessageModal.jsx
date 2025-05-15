import React, { useState } from "react";
import axios from "axios";
import "../../styles/ComposeMessageModal.css";

const ComposeMessageModal = ({ onClose, onSent, replyTo = null }) => {
  const [recipientUsername, setRecipientUsername] = useState(
    replyTo?.senderId?.username || ""
  );
  const [subject, setSubject] = useState(
    replyTo ? `Re: ${replyTo.subject}` : ""
  );
  const [body, setBody] = useState(replyTo ? `\n\n---\n${replyTo.body}` : "");
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    try {
      const usernames = recipientUsername
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);

      if (usernames.length === 0) {
        setStatus("Please enter at least one username.");
        return;
      }

      const recipientIds = [];

      for (const username of usernames) {
        try {
          const res = await axios.get(
            `${
              import.meta.env.VITE_API_URL
            }/api/users/lookup?username=${username}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          recipientIds.push(res.data._id);
        } catch (err) {
          console.error(`Failed to find user: ${username}`);
          setStatus(`User not found: ${username}`);
          return;
        }
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/messages`,
        {
          recipientIds,
          subject,
          body,
          category: "personal",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setStatus("Message sent!");
      onSent?.();
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error(err);
      setStatus("Failed to send message.");
    }
  };

  return (
    <div className="compose-modal">
      <div className="modal-header">
        <h2>Compose Message</h2>
        <button onClick={onClose}>✖</button>
      </div>

      <div className="modal-body">
        <input
          type="text"
          placeholder="Recipient username(s), comma-separated"
          value={recipientUsername}
          onChange={(e) => setRecipientUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          rows={6}
          placeholder="Write your message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
        <p>{status}</p>
      </div>
    </div>
  );
};

export default ComposeMessageModal;
