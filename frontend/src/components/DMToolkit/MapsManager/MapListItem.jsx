import React from "react";

const MapListItem = ({
  map,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  campaigns = [],
}) => {
  const handleNameChange = (e) => {
    const updated = {
      ...map,
      content: {
        ...map.content,
        name: e.target.value,
      },
    };
    onUpdate(updated);
  };

  const handleSizeChange = (field, value) => {
    const updated = {
      ...map,
      content: {
        ...map.content,
        [field]: parseInt(value) || 0,
      },
    };
    onUpdate(updated);
  };

  return (
    <li
      onClick={() => onSelect(map)}
      style={{
        cursor: "pointer",
        backgroundColor: isSelected ? "#eef" : "transparent",
        padding: "0.5rem",
      }}
    >
      <input
        type="text"
        value={map.content.name}
        onChange={handleNameChange}
        placeholder="Map Name"
      />
      <input
        type="number"
        value={map.content.width}
        onChange={(e) => handleSizeChange("width", e.target.value)}
        placeholder="Width"
      />
      <input
        type="number"
        value={map.content.height}
        onChange={(e) => handleSizeChange("height", e.target.value)}
        placeholder="Height"
      />
      <select
        value={map.content.campaign || ""}
        onChange={(e) =>
          onUpdate({
            ...map,
            content: {
              ...map.content,
              campaign: e.target.value,
            },
          })
        }
      >
        <option value="">-- Select Campaign --</option>
        {campaigns.map((c) => (
          <option key={c._id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering map selection
          onDelete(map._id);
        }}
        style={{ marginLeft: "1rem", color: "red" }}
      >
        ❌
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          //    console.log("Saving map:", map); // 👈 Add this
          onUpdate(map);
        }}
        style={{
          marginLeft: "0.5rem",
          backgroundColor: "#222",
          color: "white",
          borderRadius: "6px",
          padding: "0.3rem 0.5rem",
          fontSize: "0.8rem",
          cursor: "pointer",
        }}
        title="Save Map Changes"
      >
        💾
      </button>
    </li>
  );
};

export default MapListItem;
