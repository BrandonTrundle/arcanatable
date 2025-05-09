import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import DMView from "../components/Session/DMView";
import PlayerView from "../components/Session/PlayerView";
import { io } from "socket.io-client";
import ChatBox from "../components/Session/SharedComponents/ChatBox";
import "../styles/SessionStyles/SharedStyles/ChatBox.css";

const SessionRoom = () => {
  const { id } = useParams(); // campaign ID
  const { user } = useContext(UserContext);
  const [campaign, setCampaign] = useState(null);
  const [sessionMap, setSessionMap] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ useSocket must be inside the component
  const socket = useMemo(
    () =>
      io("http://localhost:5000", {
        withCredentials: true,
        transports: ["websocket"],
      }),
    []
  );

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`/api/campaigns/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setCampaign(data);
        fetchSessionState(data._id); // ✅ Move this INSIDE success block
      } catch (err) {
        console.error("Failed to load campaign:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSessionState = async (campaignId) => {
      try {
        const res = await fetch(`/api/sessionstate/${campaignId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setSessionMap(data.currentMapId || null);
        }
      } catch (err) {
        console.error("Failed to load session state:", err);
      }
    };

    fetchCampaign(); // ✅ leave this call here
  }, [id]);

  useEffect(() => {
    if (campaign) {
      socket.emit("joinRoom", campaign._id);
    }

    socket.on("userJoined", ({ socketId }) => {
      console.log(`🔔 User joined: ${socketId}`);
    });

    return () => {
      socket.off("userJoined");
      // ❌ Don't disconnect here unless you're permanently leaving
    };
  }, [campaign, socket]);

  if (loading) return <p>Loading session...</p>;
  if (!campaign) return <p>Campaign not found.</p>;

  return (
    <div className="session-room">
      {campaign.creator?._id === user._id ? (
        <DMView campaign={campaign} socket={socket} sessionMap={sessionMap} />
      ) : (
        <PlayerView
          campaign={campaign}
          socket={socket}
          sessionMap={sessionMap}
        />
      )}
    </div>
  );
};

export default SessionRoom;
