import React, { useState } from "react";
import DraggableResizablePanel from "../../../Common/DraggableResizablePanel";
import TokenGrid from "./TokenGrid";
import QuickCreate from "./QuickCreate";

const TokenManager = ({ token, setActiveTool, campaign }) => {
  const [activeTokenTab, setActiveTokenTab] = useState(null); // 'toolkit' or 'quick'
  const [toolkitTokens, setToolkitTokens] = useState([]);
  const [campaignTokens, setCampaignTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const API_BASE = import.meta.env.VITE_API_URL;

  const handleLoadToolkitTokens = async () => {
    setActiveTokenTab("toolkit");
    setLoadingTokens(true);

    try {
      const [toolkitRes, npcsRes, monstersRes] = await Promise.all([
        fetch(`${API_BASE}/api/dmtoolkit/type/AllTokens`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/dmtoolkit/type/NPC`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/dmtoolkit/type/Monster`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!toolkitRes.ok || !npcsRes.ok || !monstersRes.ok) {
        throw new Error("One or more token sources returned a bad response");
      }

      const [toolkitData, npcsData, monstersData] = await Promise.all([
        toolkitRes.json(),
        npcsRes.json(),
        monstersRes.json(),
      ]);

      setToolkitTokens(toolkitData);

      const campaignRelated = [...npcsData, ...monstersData]
        .filter((entry) =>
          entry.content?.campaigns?.some((name) => name === campaign.name)
        )
        .map((entry) => ({
          _id: entry._id,
          name: entry.content?.name || "Unnamed",
          imageUrl: entry.content?.image || null,
          tokenSize: entry.content?.tokenSize || "Medium",
        }));

      setCampaignTokens(campaignRelated);
    } catch (err) {
      console.error("Failed to load tokens:", err);
    } finally {
      setLoadingTokens(false);
    }
  };
  const campaignTokenIds = new Set(campaignTokens.map((t) => t._id));
  const filteredToolkitTokens = toolkitTokens.filter(
    (t) => !campaignTokenIds.has(t._id)
  );
  return (
    <DraggableResizablePanel>
      <button className="close-button" onClick={() => setActiveTool(null)}>
        ✕
      </button>

      <div className="token-tabs">
        <button onClick={handleLoadToolkitTokens}>ToolKit Tokens</button>
        <button onClick={() => setActiveTokenTab("quick")}>Quick Create</button>
      </div>

      <div className="token-panel-content">
        {activeTokenTab === "toolkit" && (
          <>
            {loadingTokens ? (
              <p>Loading tokens...</p>
            ) : toolkitTokens.length === 0 && campaignTokens.length === 0 ? (
              <p>No tokens found for this campaign.</p>
            ) : (
              <TokenGrid
                toolkitTokens={filteredToolkitTokens}
                campaignTokens={campaignTokens}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}
          </>
        )}

        {activeTokenTab === "quick" && (
          <QuickCreate
            campaign={campaign}
            onTokenCreated={(newToken) => {
              // optionally add the new token to campaignTokens list
              setCampaignTokens((prev) => [...prev, newToken]);
            }}
          />
        )}

        {!activeTokenTab && <p>Select an option above to begin.</p>}
      </div>
    </DraggableResizablePanel>
  );
};

export default TokenManager;
