import React from "react";

const SavingThrowsSection = ({
  savingThrows,
  onChange,
  onRemove,
  newSave,
  setNewSave,
  onAdd,
}) => {
  return (
    <>
      <h3>Saving Throws</h3>
      {Object.entries(savingThrows || {}).map(([key, val]) => (
        <div key={key}>
          <label>{key}</label>
          <input
            value={val}
            onChange={(e) => onChange("savingThrows", key, e.target.value)}
          />
          <button
            onClick={() => onRemove("savingThrows", key)}
            className="remove-btn"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="key-pair-row">
        <input
          type="text"
          placeholder="Save name (e.g. CON)"
          value={newSave.key}
          onChange={(e) =>
            setNewSave((prev) => ({ ...prev, key: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Value (e.g. +5)"
          value={newSave.value}
          onChange={(e) =>
            setNewSave((prev) => ({ ...prev, value: e.target.value }))
          }
        />
        <button
          onClick={() => {
            if (newSave.key && newSave.value) {
              onAdd("savingThrows", newSave.key, newSave.value);
              setNewSave({ key: "", value: "" });
            }
          }}
        >
          Add
        </button>
      </div>
    </>
  );
};

export default SavingThrowsSection;
