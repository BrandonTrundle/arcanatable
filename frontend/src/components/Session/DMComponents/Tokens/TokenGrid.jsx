import React from "react";

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
        {toolkitTokens
          .filter((token) =>
            (token.title || token.content?.name || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
          .map((token) =>
            token.content?.imageUrl ? (
              <li
                key={token._id}
                className="token-thumb-wrapper"
                data-tooltip={`${
                  token.title || token.content?.name || "Unnamed"
                } (${
                  token.content?.tokenSize ||
                  token.content?.size ||
                  "Unknown size"
                })`}
              >
                <div className="token-image-container">
                  <img
                    src={token.content.imageUrl}
                    alt={token.title || token.content?.name}
                    className="token-thumbnail"
                  />
                </div>
                <p
                  style={{
                    color: "white",
                    fontSize: "0.7rem",
                    margin: "0.25rem 0 0",
                  }}
                >
                  {token.title || token.content?.name || "Unnamed"} <br />(
                  {token.content?.tokenSize ||
                    token.content?.size ||
                    "Unknown size"}
                  )
                </p>
              </li>
            ) : null
          )}

        {campaignTokens
          .filter((token) =>
            (token.name || "").toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((token) =>
            token.imageUrl ? (
              <li
                key={token._id}
                className="token-thumb-wrapper"
                data-tooltip={`${token.name || "Unnamed"} (${
                  token.tokenSize || "Unknown size"
                })`}
              >
                <div className="token-image-container">
                  <img
                    src={token.imageUrl}
                    alt={token.name}
                    className="token-thumbnail"
                  />
                </div>
                <p
                  style={{
                    color: "white",
                    fontSize: "0.7rem",
                    margin: "0.25rem 0 0",
                  }}
                >
                  {token.name || "Unnamed"} <br />(
                  {token.tokenSize || "Unknown size"})
                </p>
              </li>
            ) : null
          )}
      </ul>
    </>
  );
};

export default TokenGrid;
