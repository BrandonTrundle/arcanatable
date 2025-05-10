import React, { useState } from "react";
import { useCharacters } from "./hooks/useCharacter";
import { useToolkitTokens } from "./hooks/useToolkitTokens";
import QuickCreateForm from "./QuickCreateForm";
import "../../../../styles/SessionStyles/PlayerStyles/PlayerTokenManager.css";

const PlayerTokenManager = ({ campaignId, userToken, onClose }) => {
  const [activeTab, setActiveTab] = useState("characters");
  const { characters, loading: loadingCharacters } = useCharacters(
    campaignId,
    userToken
  );
  const {
    tokens: toolkitTokens,
    loading: loadingToolkit,
    fetchTokens: fetchToolkitTokens,
    saveToken,
    deleteToken,
  } = useToolkitTokens(userToken);

  return (
    <div className="player-token-manager">
      <div className="token-panel-header">
        <div className="tab-buttons">
          <button
            className={activeTab === "characters" ? "active" : ""}
            onClick={() => setActiveTab("characters")}
          >
            🧙 Character Tokens
          </button>
          <button
            className={activeTab === "quick" ? "active" : ""}
            onClick={() => setActiveTab("quick")}
          >
            ⚡ Quick Create
          </button>
          <button
            className={activeTab === "toolkit" ? "active" : ""}
            onClick={() => {
              setActiveTab("toolkit");
              fetchToolkitTokens();
            }}
          >
            🗃️ Toolkit Tokens
          </button>
        </div>

        <button className="close-token-panel" onClick={onClose}>
          ✖
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "characters" && (
          <>
            {loadingCharacters ? (
              <p style={{ color: "#fff" }}>Loading characters...</p>
            ) : characters.length === 0 ? (
              <p style={{ color: "#fff" }}>No characters found.</p>
            ) : (
              <ul className="token-image-grid">
                {characters.map((char) => (
                  <li key={char._id} className="token-thumb-wrapper">
                    <div className="token-image-container">
                      <img
                        src={char.portraitImage}
                        alt={char.charname}
                        className="token-thumbnail"
                        draggable
                        onDragStart={(e) => {
                          const payload = {
                            id: char._id,
                            name: char.charname,
                            imageUrl: char.portraitImage,
                            tokenSize: "Medium",
                            layer: "player",
                          };
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify(payload)
                          );
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                      />
                    </div>
                    <p>{char.charname}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {activeTab === "quick" && <QuickCreateForm onSave={saveToken} />}

        {activeTab === "toolkit" && (
          <ul className="token-image-grid">
            {loadingToolkit ? (
              <p style={{ color: "#fff" }}>Loading tokens...</p>
            ) : toolkitTokens.length === 0 ? (
              <p style={{ color: "#fff" }}>No saved tokens in your toolkit.</p>
            ) : (
              toolkitTokens.map((token) => (
                <li key={token._id} className="token-thumb-wrapper">
                  <div className="token-image-container">
                    <img
                      src={token.imageUrl}
                      alt={token.name}
                      className="token-thumbnail"
                      draggable
                      onDragStart={(e) => {
                        const payload = {
                          id: `toolkit-${token._id}`,
                          name: token.name,
                          imageUrl: token.imageUrl,
                          tokenSize: token.size,
                          layer: "player",
                        };
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify(payload)
                        );
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                    />
                  </div>
                  <p>{token.name}</p>
                  <button
                    className="delete-token-button"
                    onClick={async () => {
                      if (
                        !window.confirm("Delete this token from your toolkit?")
                      )
                        return;
                      await deleteToken(token._id);
                    }}
                  >
                    🗑️
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlayerTokenManager;
