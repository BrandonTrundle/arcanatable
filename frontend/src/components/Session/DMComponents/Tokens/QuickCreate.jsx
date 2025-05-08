import React from "react";
import TokenForm from "../../../DMToolkit/TokenForm";

const QuickCreate = ({ campaign, onTokenCreated }) => {
  return (
    <div style={{ padding: "1rem" }}>
      <TokenForm />
    </div>
  );
};

export default QuickCreate;
