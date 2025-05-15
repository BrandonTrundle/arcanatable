import React from "react";

const SpeedSection = ({ speed, onChange }) => {
  return (
    <>
      <h3>Speed</h3>
      {["walk", "fly", "swim", "climb", "burrow"].map((type) => (
        <div key={type}>
          <label>{type}</label>
          <input
            value={speed[type]}
            onChange={(e) => onChange("speed", type, e.target.value)}
          />
        </div>
      ))}
    </>
  );
};

export default SpeedSection;
