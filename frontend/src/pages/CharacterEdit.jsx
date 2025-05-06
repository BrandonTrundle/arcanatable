import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Auth/Navbar";
import BasicsTab from "../components/CharacterForm/BasicsTab";
import "../styles/CharacterSheetStyles/CharacterDashboard.css";
import "../styles/CharacterSheetStyles/CharacterSheet.css";
import backgroundImage from "../assets/CharacterDashboard.png";
import PageTwo from "../components/CharacterForm/PageTwo";

const CharacterEdit = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basics");

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const res = await fetch(`/api/characters/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        console.error("Error fetching character:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

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
      console.log("Submitting character:", formData);
      const res = await fetch(`/api/characters/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        navigate("/characters");
      } else {
        console.error("Update failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderTabButton = (id, label) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={`tab-button ${activeTab === id ? "active" : ""}`}
    >
      {label}
    </button>
  );

  if (loading || !formData) return <p>Loading character...</p>;

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
          <h1>Edit Character</h1>

          {/* Tab Navigation */}
          <div className="tab-header">
            {renderTabButton("basics", "Page 1")}
            {renderTabButton("attributes", "Page 2")}
            {renderTabButton("saves", "Page 3")}
            {/* More tab buttons can go here */}
          </div>

          <form onSubmit={handleSubmit}>
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
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CharacterEdit;
