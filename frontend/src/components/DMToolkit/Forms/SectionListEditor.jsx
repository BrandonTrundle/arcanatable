import React from "react";

const SectionListEditor = ({ label, items, onChange, onRemove, onAdd }) => {
  return (
    <div>
      <h3>
        {label.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
      </h3>
      {items?.map((item, index) => (
        <div key={index} className="custom-section-block">
          <label>Title</label>
          <input
            value={item.name}
            onChange={(e) => onChange(label, index, "name", e.target.value)}
          />
          <label>Description</label>
          <textarea
            value={item.desc}
            onChange={(e) => onChange(label, index, "desc", e.target.value)}
          />
          <button onClick={() => onRemove(label, index)} className="remove-btn">
            Remove
          </button>
        </div>
      ))}
      <button className="add-section-btn" onClick={() => onAdd(label)}>
        + Add {label}
      </button>
    </div>
  );
};

export default SectionListEditor;
