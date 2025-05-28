import React, { useState, useEffect } from "react";
import "../styles/DMToolkit/DMToolkit.css";
import WizardsTower from "../assets/WizardsTower.png";

import MonsterManager from "../components/DMToolkit/Monster/MonsterManager";
import NPCManager from "../components/DMToolkit/NPCManager";
import MapsManager from "../components/DMToolkit/MapsManager/MapsManager";
import TokenForm from "../components/DMToolkit/TokenForm";
import { buildImageUrl } from "../../src/utils/imageUtils"; // adjust path if needed
import axios from "axios";

const DMToolkit = () => {
  const [activeTool, setActiveTool] = useState("monsters"); // default to monsters
  const [tokens, setTokens] = useState([]);

  const toolList = [
    { key: "all", label: "📜 All" },
    { key: "monsters", label: "👹 Monsters" },
    { key: "npcs", label: "🧙 NPCs" },
    { key: "potions", label: "🧪 Potions" },
    { key: "items", label: "📦 Items" },
    { key: "maps", label: "🗺️ Maps" },
    { key: "world", label: "📖 World" },
    { key: "rules", label: "⚙️ Custom Rules" },
    { key: "tokens", label: "🧩 Tokens" },
    { key: "cheatsheet", label: "📝 Cheat Sheet" },
  ];

  const fetchTokens = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/dmtoolkit`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const tokenItems = res.data.filter(
        (item) => item.toolkitType === "Token"
      );
      setTokens(tokenItems);
    } catch (err) {
      console.error("Failed to fetch tokens:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/dmtoolkit/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      fetchTokens(); // refresh list
    } catch (err) {
      console.error("Failed to delete token:", err);
    }
  };

  useEffect(() => {
    if (activeTool === "tokens") {
      fetchTokens();
    }
  }, [activeTool]);

  return (
    <div
      className="dm-toolkit-wrapper"
      style={{ backgroundImage: `url(${WizardsTower})` }}
    >
      <div className="dm-toolkit-container">
        <aside className="dm-sidebar">
          <h2>DM Toolkit</h2>
          <ul className="dm-nav-list">
            {toolList.map((tool) => (
              <li
                key={tool.key}
                onClick={() => setActiveTool(tool.key)}
                style={{
                  fontWeight: activeTool === tool.key ? "bold" : "normal",
                  textDecoration:
                    activeTool === tool.key ? "underline" : "none",
                }}
              >
                {tool.label}
              </li>
            ))}
          </ul>
        </aside>

        <main className="dm-main">
          {activeTool === "monsters" && <MonsterManager />}
          {activeTool === "npcs" && <NPCManager />}
          {activeTool === "maps" && <MapsManager />}

          {activeTool === "tokens" && (
            <div className="dm-section">
              <h2>🧩 Token Creator</h2>
              <TokenForm onCreated={fetchTokens} />

              <h3 style={{ marginTop: "2rem" }}>🧱 Created Tokens</h3>
              <div className="token-list">
                {tokens.map((token) => (
                  <div
                    key={token._id}
                    className="token-card"
                    title={`Size: ${token.content.size}`}
                  >
                    <img
                      src={buildImageUrl(token.content.imageUrl)}
                      alt={token.title}
                    />

                    <span>{token.title}</span>
                    <button onClick={() => handleDelete(token._id)}>
                      🗑 Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DMToolkit;
