import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ComposeMessageModal from '../../components/Modal/ComposeMessageModal';
import '../../styles/MessagePage.css';

const MessagePage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [userId, setUserId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/messages', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUserId(res.data._id);
    };
  
    fetchUser();
    fetchMessages();
  }, []);

  const handleSelect = async (msg) => {
    setSelectedMessage(msg);

    if (!msg.readBy.includes(userId)) {
      try {
        await axios.patch(`/api/messages/${msg._id}/read`, null, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setMessages((prev) =>
          prev.map((m) =>
            m._id === msg._id ? { ...m, readBy: [...m.readBy, userId] } : m
          )
        );
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
  };

  const handleArchive = async () => {
    if (!selectedMessage) return;

    try {
      await axios.patch(`/api/messages/${selectedMessage._id}/archive`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      fetchMessages();
      setSelectedMessage(null);
    } catch (err) {
      console.error('Failed to archive message', err);
    }
  };

  return (
    <div className="message-page">
      <div className="message-sidebar">
        <h2>Inbox</h2>

        <div className="message-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'personal' ? 'active' : ''}
            onClick={() => setFilter('personal')}
          >
            Personal
          </button>
        </div>

        <button onClick={() => setShowComposer(true)}>Compose</button>

        {messages
          .filter((msg) => filter === 'all' || msg.category === filter)
          .filter((msg) => !msg.archivedBy.includes(userId)) // ← NEW
          .map((msg) => (
            <div
              key={msg._id}
              className={`message-list-item ${selectedMessage?._id === msg._id ? 'active' : ''} ${!msg.readBy.includes(userId) ? 'unread' : ''}`}
              onClick={() => handleSelect(msg)}
            >
              <strong>{msg.senderId.username}</strong>
              <p>{msg.subject}</p>
            </div>
          ))}
      </div>

      <div className="message-viewer">
        {selectedMessage ? (
          <>
            <h3>{selectedMessage.subject}</h3>
            <p><em>From: {selectedMessage.senderId.username}</em></p>
            <p>{selectedMessage.body}</p>
            <button
              onClick={() => {
                setReplyTo(selectedMessage);
                setShowComposer(true);
              }}
            >
              Reply
            </button>
            <button onClick={handleArchive}>Archive</button>
          </>
        ) : (
          <p>Select a message to view</p>
        )}
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
