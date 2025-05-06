import React from "react";
import CharacterBanner from "./CharacterBanner";
import CharacterStatsBlock from "./CharacterStatsBlock";

const PageTwoHeader = ({ formData, handleChange }) => (
  <div className="page-two-header">
    <CharacterBanner formData={formData} handleChange={handleChange} />
    <CharacterStatsBlock formData={formData} handleChange={handleChange} />
  </div>
);

export default PageTwoHeader;
