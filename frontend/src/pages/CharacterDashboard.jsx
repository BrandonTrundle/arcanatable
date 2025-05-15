import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Auth/Navbar";
import backgroundImage from "../assets/CharacterDashboard.png";
import "../styles/CharacterSheetStyles/CharacterDashboard.css";

const CharacterDashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/characters`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        //   console.log("Fetched characters:", data); // Debug output
        // If response is wrapped, adjust accordingly:
        const charList = Array.isArray(data) ? data : data.characters || [];
        setCharacters(charList);
      } catch (error) {
        console.error("Failed to fetch characters:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchCharacters();
    }
  }, [user]);

  const handleCreate = () => {
    navigate("/characters/create");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this character?"))
      return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/characters/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.ok) {
        setCharacters((prev) => prev.filter((char) => char._id !== id));
      } else {
        const err = await res.json();
        console.error("Failed to delete:", err.message);
      }
    } catch (err) {
      console.error("Error deleting character:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="character-dashboard"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          paddingTop: "10rem",
          backgroundPosition: "0% 25%",
        }}
      >
        <div className="character-dashboard-content">
          <h1>Your Characters</h1>
          <button onClick={handleCreate} className="create-character-btn">
            Create New Character
          </button>
          {loading ? (
            <p>Loading...</p>
          ) : Array.isArray(characters) && characters.length > 0 ? (
            <ul className="character-list">
              {characters.map((char) => (
                <li key={char._id} className="character-card">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${
                      char.portraitImage || "/default-portrait.png"
                    }`}
                    alt={`${char.charname} portrait`}
                    className="character-portrait"
                  />

                  <div className="character-info">
                    <strong>{char.charname}</strong> – {char.class} lvl{" "}
                    {char.level}
                  </div>
                  <div className="character-actions">
                    <button
                      onClick={() => navigate(`/characters/${char._id}/edit`)}
                      className="edit-character-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(char._id)}
                      className="delete-character-btn"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No characters found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default CharacterDashboard;
