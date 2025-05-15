import React from "react";
import MonsterForm from "./MonsterForm";
import MonsterPreview from "./MonsterPreview";

const MonsterEditorPanel = ({
  monster,
  setMonster,
  onSubmit,
  onClose,
  isEditing,
}) => {
  if (!monster) return null;

  return (
    <>
      <MonsterForm
        monster={monster}
        setMonster={setMonster}
        closeForm={onClose}
        onSubmit={onSubmit}
      />
      <MonsterPreview data={monster} />
    </>
  );
};

export default MonsterEditorPanel;
