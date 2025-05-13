import React from "react";

const MapListItem = ({
  map,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  campaigns = [],
}) => {
  const handleUpdateField = (field, value) => {
    const updated = {
      ...map,
      content: {
        ...map.content,
        [field]:
          field === "width" || field === "height"
            ? parseInt(value) || 0
            : value,
      },
    };
    onUpdate(updated);
  };

  const handleCampaignChange = (e) => {
    const updated = {
      ...map,
      content: {
        ...map.content,
        campaign: e.target.value, // stores campaign ID
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
        borderBottom: "1px solid #ccc",
      }}
    >
      <input
        type="text"
        value={map.content.name}
        onChange={(e) => handleUpdateField("name", e.target.value)}
        placeholder="Map Name"
      />

      <input
        type="number"
        value={map.content.width}
        onChange={(e) => handleUpdateField("width", e.target.value)}
        placeholder="Width"
      />

      <input
        type="number"
        value={map.content.height}
        onChange={(e) => handleUpdateField("height", e.target.value)}
        placeholder="Height"
      />

      <select
        value={map.content.campaign || ""}
        onChange={handleCampaignChange}
      >
        <option value="">-- Select Campaign --</option>
        {campaigns.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(map._id);
        }}
        style={{ marginLeft: "1rem", color: "red" }}
      >
        ❌
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log("Saving map:", map);
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
