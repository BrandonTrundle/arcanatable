import React from "react";

const InputGroup = ({ label, name, value, onChange, type = "text" }) => (
  <div className="input-group">
    <input type={type} name={name} value={value} onChange={onChange} />
    <small>{label}</small>
  </div>
);

export default InputGroup;
