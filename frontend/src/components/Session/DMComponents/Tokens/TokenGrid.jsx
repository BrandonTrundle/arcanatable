import React from "react";
import { buildImageUrl } from "../../../../utils/imageUtils";

const TokenGrid = ({
  toolkitTokens,
  campaignTokens,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <>
      <input
        type="text"
        placeholder="Search tokens..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem",
          borderRadius: "4px",
          border: "1px solid #aaa",
          fontSize: "0.9rem",
        }}
      />

      <ul className="token-image-grid">
        {/* Toolkit Tokens (e.g., NPCs, Creatures) */}
        {toolkitTokens
          .filter((token) =>
            (token.title || token.content?.name || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
          .map((token) => {
            const content = token.content || {};
            const name = token.title || content.name || "Unnamed";
            const imageUrl =
              content.image || content.avatar || content.imageUrl || "";
            const tokenSize =
              content.tokenSize || content.size || "Unknown size";

            if (!imageUrl) {
              console.warn("⚠️ Skipping toolkit token with no image:", token);
              return null;
            }

            return (
              <li
                key={token._id}
                className="token-thumb-wrapper"
                data-tooltip={`${name} (${tokenSize})`}
              >
                <div className="token-image-container">
                  <img
                    src={buildImageUrl(imageUrl)}
                    alt={name}
                    className="token-thumbnail"
                    draggable
                    onDragStart={(e) => {
                      const payload = {
                        id: token._id,
                        name,
                        imageUrl,
                        tokenSize,
                        layer: "dm",
                      };

                      //console.log("✅ Drag Start Payload (toolkit):", payload);

                      try {
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify(payload)
                        );
                        e.dataTransfer.effectAllowed = "copy";
                      } catch (err) {
                        console.error("❌ Failed to set drag data:", err);
                      }
                    }}
                  />
                </div>
                <p
                  style={{
                    color: "white",
                    fontSize: "0.7rem",
                    margin: "0.25rem 0 0",
                  }}
                >
                  {name} <br />({tokenSize})
                </p>
              </li>
            );
          })}

        {/* Campaign Tokens (flat format) */}
        {campaignTokens
          .filter((token) =>
            (token.name || "").toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((token) => {
            const name = token.name || "Unnamed";
            const imageUrl = token.imageUrl || "";
            const tokenSize = token.tokenSize || "Unknown size";

            if (!imageUrl) {
              console.warn("⚠️ Skipping campaign token with no image:", token);
              return null;
            }

            return (
              <li
                key={token._id}
                className="token-thumb-wrapper"
                data-tooltip={`${name} (${tokenSize})`}
              >
                <div className="token-image-container">
                  <img
                    src={buildImageUrl(imageUrl)}
                    alt={name}
                    className="token-thumbnail"
                    draggable
                    onDragStart={(e) => {
                      const payload = {
                        id: token._id,
                        name,
                        imageUrl,
                        tokenSize,
                        layer: "dm",
                      };

                      //console.log("✅ Drag Start Payload (campaign):", payload);

                      try {
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify(payload)
                        );
                        e.dataTransfer.effectAllowed = "copy";
                      } catch (err) {
                        console.error("❌ Failed to set drag data:", err);
                      }
                    }}
                  />
                </div>
                <p
                  style={{
                    color: "white",
                    fontSize: "0.7rem",
                    margin: "0.25rem 0 0",
                  }}
                >
                  {name} <br />({tokenSize})
                </p>
              </li>
            );
          })}
      </ul>
    </>
  );
};

export default TokenGrid;
