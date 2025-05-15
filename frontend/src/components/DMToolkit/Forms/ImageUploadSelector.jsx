import React from "react";

const ImageUploadSelector = ({ useUpload, setUseUpload, image, onChange }) => {
  return (
    <>
      <h3>Monster Image</h3>
      <div className="image-input-toggle">
        <label>
          <input
            type="radio"
            name="imageSource"
            value="url"
            checked={!useUpload}
            onChange={() => setUseUpload(false)}
          />
          Use URL
        </label>

        <label>
          <input
            type="radio"
            name="imageSource"
            value="upload"
            checked={useUpload}
            onChange={() => setUseUpload(true)}
          />
          Upload Image
        </label>
      </div>

      {!useUpload ? (
        <>
          <label>Image URL</label>
          <input
            type="text"
            placeholder="https://example.com/your-image.jpg"
            value={typeof image === "string" ? image : ""}
            onChange={(e) => onChange("image", e.target.value)}
          />
        </>
      ) : (
        <>
          <label>Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                onChange("image", file);
              }
            }}
          />
        </>
      )}
    </>
  );
};

export default ImageUploadSelector;
