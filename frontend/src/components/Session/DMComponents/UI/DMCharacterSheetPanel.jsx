import React, { useState } from "react";
import DMCharacterPanel from "../CharacterSheets/DMCharacterPanel";
import CharacterSheetPanel from "../../PlayerComponents/CharacterSheetPanel";

const DMCharacterSheetPanel = ({ campaignId, setActiveTool }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentTab, setCurrentTab] = useState("basics");

  const handleFormChange = (e) => {
    const { name, type, value, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setSelectedCharacter((prev) => {
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

  const saveCharacter = async () => {
    if (!selectedCharacter?._id) return;

    try {
      const formData = new FormData();

      for (const [key, value] of Object.entries(selectedCharacter)) {
        if (
          [
            "portraitImageFile",
            "portraitImagePreview",
            "orgSymbolImageFile",
            "orgSymbolImagePreview",
          ].includes(key)
        )
          continue;

        formData.append(
          key,
          typeof value === "object" ? JSON.stringify(value) : value ?? ""
        );
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/characters/${
          selectedCharacter._id
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setSelectedCharacter(updated);
      } else {
        const err = await res.json();
        console.error("Update failed:", err.message);
      }
    } catch (err) {
      console.error("❌ Error saving character:", err);
    }
  };

  return (
    <div className="character-sheet-panel fly-in active dm-character-editor">
      {!selectedCharacter ? (
        <>
          <DMCharacterPanel
            campaignId={campaignId}
            onSelect={(char) => {
              setSelectedCharacter(char);
              setCurrentTab("basics");
            }}
          />
          <button
            onClick={() => {
              setActiveTool(null);
            }}
            className="close-panel-btn"
          >
            Close
          </button>
        </>
      ) : (
        <CharacterSheetPanel
          campaignId={campaignId}
          selectedCharacter={selectedCharacter}
          setSelectedCharacter={setSelectedCharacter}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          saveCharacter={saveCharacter}
          handleFormChange={handleFormChange}
          setActiveTool={setActiveTool}
          className="dm-character-editor"
        />
      )}
    </div>
  );
};

export default DMCharacterSheetPanel;
