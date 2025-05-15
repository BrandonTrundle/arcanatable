import React from "react";
import "../../../styles/MonsterManager.css";

import MonsterList from "./MonsterList";
import MonsterEditorPanel from "./MonsterEditorPanel";
import MonsterCampaigns from "./MonsterCampaigns";
import MonsterPreview from "./MonsterPreview";

import { useMonsters } from "../hooks/useMonsters";
import { useCampaigns } from "../hooks/useCampaign";
import defaultMonster from "../../../constants/defaultMonster";

const MonsterManager = () => {
  const {
    monsters,
    selectedMonster,
    isFormOpen,
    isEditing,
    setSelectedMonster,
    setIsFormOpen,
    setIsEditing,
    handleCreate,
    handleUpdate,
    handleDelete,
    assignCampaign,
    removeCampaign,
    resetForm,
  } = useMonsters();

  const { campaigns } = useCampaigns();

  const handleNewClick = () => {
    setSelectedMonster({ ...defaultMonster });
    setIsFormOpen(true);
    setIsEditing(false);
  };

  const handleEditClick = (monster) => {
    setSelectedMonster(monster);
    setIsFormOpen(true);
    setIsEditing(true);
  };

  return (
    <div className="monster-manager-container">
      <div className="monster-manager-header">
        <h3>Saved Monsters</h3>
        <button onClick={handleNewClick}>+ New Monster</button>
      </div>

      <MonsterList
        monsters={monsters}
        selectedMonster={selectedMonster}
        onSelect={setSelectedMonster}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        renderCampaignControls={(mon) => (
          <MonsterCampaigns
            monster={mon}
            campaigns={campaigns}
            assignCampaign={assignCampaign}
            removeCampaign={removeCampaign}
          />
        )}
      />

      {isFormOpen && selectedMonster && (
        <MonsterEditorPanel
          monster={selectedMonster}
          setMonster={setSelectedMonster}
          onSubmit={isEditing ? handleUpdate : handleCreate}
          onClose={resetForm}
          isEditing={isEditing}
        />
      )}

      {/* 👇 Add this block outside the form condition */}
      {!isFormOpen && selectedMonster && (
        <MonsterPreview data={selectedMonster} />
      )}
    </div>
  );
};

export default MonsterManager;
