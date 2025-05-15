import React from "react";

const SensesSection = ({ senses, onChange }) => {
  return (
    <>
      <h3>Senses</h3>
      {[
        "darkvision",
        "blindsight",
        "tremorsense",
        "truesight",
        "passivePerception",
      ].map((sense) => (
        <div key={sense}>
          <label>{sense}</label>
          <input
            value={senses[sense]}
            onChange={(e) => onChange("senses", sense, e.target.value)}
          />
        </div>
      ))}
    </>
  );
};

export default SensesSection;
