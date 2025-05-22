import React, { useEffect, useState } from "react";

const DMCharacterPanel = ({ campaignId, onSelect }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/characters/campaign/${campaignId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await response.json();
        const charList = Array.isArray(data) ? data : data.characters || [];
        setCharacters(charList);
      } catch (error) {
        console.error("❌ DM failed to fetch characters:", error);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCharacters();
    }
  }, [campaignId]);

  if (loading) return <p>Loading characters...</p>;
  if (characters.length === 0) return <p>No characters found.</p>;

  return (
    <ul className="session-character-list">
      {characters.map((char) => (
        <li
          key={char._id}
          className="character-card"
          onClick={() => onSelect(char)}
        >
          <img
            src={
              char.portraitImage?.startsWith("http")
                ? char.portraitImage
                : char.portraitImage
                ? `${import.meta.env.VITE_API_URL}${char.portraitImage}`
                : "/default-portrait.png"
            }
            alt={`${char.charname} portrait`}
            className="character-portrait"
            onError={(e) => {
              e.currentTarget.src = "/default-portrait.png";
            }}
          />

          <div className="character-info">
            <strong>{char.charname}</strong> – {char.class} lvl {char.level}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default DMCharacterPanel;
