import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Auth/Navbar";
import backgroundImage from "../assets/CharacterDashboard.png";
import emptyCharacter from "../data/emptyCharacter";
import BasicsTab from "../components/CharacterForm/BasicsTab";
import "../styles/CharacterSheetStyles/CharacterCreate.css";
import "../styles/CharacterSheetStyles/AbilityBlock.css";
import "../styles/CharacterSheetStyles/BonusSection.css";
import "../styles/CharacterSheetStyles/CharacterInfo.css";
import "../styles/CharacterSheetStyles/CharacterSheet.css";
import "../styles/CharacterSheetStyles/CombatStats.css";
import "../styles/CharacterSheetStyles/PersonalityTraits.css";
import "../styles/CharacterSheetStyles/CharacterInfo.css";
import PageTwo from "../components/CharacterForm/PageTwo";

const CharacterCreate = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basics");

  const renderTabButton = (id, label) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={`tab-button ${activeTab === id ? "active" : ""}`}
    >
      {label}
    </button>
  );

  const [formData, setFormData] = useState(emptyCharacter);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: val,
          },
        };
      }
      return { ...prev, [name]: val };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate("/characters");
      } else {
        const err = await response.json();
        console.error("Failed to create character:", err.message);
      }
    } catch (err) {
      console.error(err);
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
          backgroundPosition: "0% 25%",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          paddingTop: "10rem",
        }}
      >
        <div className="character-dashboard-content-main">
          <h1>Create a New Character</h1>

          {/* Tab Navigation */}
          <div className="tab-header">
            {renderTabButton("basics", "Page 1")}
            {renderTabButton("attributes", "Page 2")}
            {renderTabButton("saves", "Page 3")}
            {/* More tab buttons coming later */}
          </div>

          <form onSubmit={handleSubmit}>
            {/* TAB: BASICS */}
            {activeTab === "basics" && (
              <BasicsTab
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
              />
            )}
            {activeTab === "attributes" && (
              <PageTwo
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
              />
            )}
            <button type="submit" className="create-character-btn">
              Save Character
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CharacterCreate;
