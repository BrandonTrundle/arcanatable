import React from "react";

const MapCreationForm = ({ onSubmit, onImageUpload }) => {
  return (
    <div
      style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}
    >
      <h4>[MapCreationForm Placeholder]</h4>
      <button
        onClick={() => {
          const dummyMap = {
            name: "New Map",
            width: 1000,
            height: 800,
            imageUrl: "https://via.placeholder.com/1000x800",
          };
          onSubmit(dummyMap);
        }}
      >
        Create Dummy Map
      </button>
    </div>
  );
};

export default MapCreationForm;
