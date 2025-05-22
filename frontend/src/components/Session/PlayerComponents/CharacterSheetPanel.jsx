import React from "react";
import CharacterPanel from "./CharacterPanel";
import BasicsTab from "../../CharacterForm/BasicsTab";
import PageTwo from "../../CharacterForm/PageTwo";
import PageThree from "../../CharacterForm/PageThree";
import "../../../styles/CharacterSheetStyles/CharacterSheet.css";

const CharacterSheetPanel = ({
  campaignId,
  selectedCharacter,
  setSelectedCharacter,
  currentTab,
  setCurrentTab,
  saveCharacter,
  handleFormChange,
  setActiveTool,
  className = "",
}) => {
  return (
    <div
      className={`player-character-panel character-sheet-panel fly-in active ${className}`}
    >
      {!selectedCharacter ? (
        <>
          <CharacterPanel
            campaignId={campaignId}
            onSelect={(char) => {
              setSelectedCharacter(char);
              setCurrentTab("basics");
            }}
          />
          <button
            onClick={async () => {
              await saveCharacter();
              setActiveTool(null);
            }}
            className="close-panel-btn"
          >
            Close
          </button>
        </>
      ) : (
        <div className="character-sheet-panel">
          <h2>
            {selectedCharacter.charname} – Level {selectedCharacter.level}{" "}
            {selectedCharacter.class}
          </h2>
          <button
            onClick={async () => {
              await saveCharacter();
              setSelectedCharacter(null);
            }}
          >
            ← Back to List
          </button>

          <div
            className="character-tab-buttons"
            style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}
          >
            <button
              className={currentTab === "basics" ? "active-tab" : ""}
              onClick={async () => {
                await saveCharacter();
                setCurrentTab("basics");
              }}
            >
              Basics
            </button>
            <button
              className={currentTab === "page2" ? "active-tab" : ""}
              onClick={async () => {
                await saveCharacter();
                setCurrentTab("page2");
              }}
            >
              Page 2
            </button>
            <button
              className={currentTab === "page3" ? "active-tab" : ""}
              onClick={async () => {
                await saveCharacter();
                setCurrentTab("page3");
              }}
            >
              Spells
            </button>
          </div>

          {currentTab === "basics" && (
            <BasicsTab
              formData={selectedCharacter}
              handleChange={handleFormChange}
              setFormData={setSelectedCharacter}
            />
          )}
          {currentTab === "page2" && (
            <PageTwo
              formData={selectedCharacter}
              handleChange={handleFormChange}
              setFormData={setSelectedCharacter}
            />
          )}
          {currentTab === "page3" && (
            <PageThree
              formData={selectedCharacter}
              handleChange={handleFormChange}
              setFormData={setSelectedCharacter}
            />
          )}

          <button onClick={saveCharacter} className="save-character-btn">
            💾 Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterSheetPanel;
