import React from "react";

const DescriptionEditor = ({ value, onChange }) => (
  <>
    <label>Description (Lore)</label>
    <textarea
      value={value}
      onChange={(e) => onChange("description", e.target.value)}
    />
  </>
);

export default DescriptionEditor;
