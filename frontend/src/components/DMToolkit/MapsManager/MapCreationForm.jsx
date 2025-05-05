import React, { useState } from 'react';

const MapCreationForm = ({ onSubmit, onImageUpload }) => {
  const [form, setForm] = useState({
    name: '',
    width: '',
    height: '',
    image: null,
    imageUrl: '',
    previewUrl: ''
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const imageUrl = await onImageUpload(file);

    setForm(prev => ({
      ...prev,
      image: file,
      imageUrl,
      previewUrl
    }));
  };

  const handleSubmit = () => {
    const { name, width, height, imageUrl } = form;
    if (!name || !width || !height || !imageUrl) return;
    onSubmit({ name, width, height, imageUrl });
    setForm({ name: '', width: '', height: '', image: null, imageUrl: '', previewUrl: '' });
  };

  return (
    <div className="map-form">
      <input
        type="text"
        placeholder="Map Name"
        value={form.name}
        onChange={e => handleChange('name', e.target.value)}
      />
      <input
        type="number"
        placeholder="Width (squares)"
        value={form.width}
        onChange={e => handleChange('width', e.target.value)}
      />
      <input
        type="number"
        placeholder="Height (squares)"
        value={form.height}
        onChange={e => handleChange('height', e.target.value)}
      />
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {form.previewUrl && (
        <img src={form.previewUrl} alt="Map Preview" className="map-preview" />
      )}

      <button onClick={handleSubmit}>➕ Add Map</button>
    </div>
  );
};

export default MapCreationForm;
