import React from "react";
import PageTwoHeader from "./PageTwoHeader";
import "../../styles/CharacterSheetStyles/CharacterSheet.css";
import AppearanceAndAllies from "./AppearanceAndAllies";
import BackstoryAndExtras from "./BackstoryAndExtras";

const PageTwo = ({ formData, handleChange, setFormData }) => {
  return (
    <div className="page-two">
      <PageTwoHeader formData={formData} handleChange={handleChange} />
      <AppearanceAndAllies
        formData={formData}
        handleChange={handleChange}
        setFormData={setFormData}
      />
      <BackstoryAndExtras formData={formData} handleChange={handleChange} />

      {/* Future Sections Will Go Here */}
      {/* <Spellcasting /> */}
      {/* <AlliesAndOrganizations /> */}
      {/* <FeaturesTraitsBlock /> */}
    </div>
  );
};

export default PageTwo;
