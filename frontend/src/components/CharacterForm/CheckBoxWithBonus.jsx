import React from "react";

const CheckBoxWithBonus = ({
  name, // for checkbox (proficiency)
  checked, // boolean for checkbox
  onChange, // shared handler
  bonusName, // for bonus number input
  bonusValue, // value of the bonus
  label, // display label
}) => (
  <div className="check-input-row">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} />
    <input
      type="number"
      name={bonusName}
      value={bonusValue}
      onChange={onChange}
    />
    <label>{label}</label>
  </div>
);

export default CheckBoxWithBonus;
