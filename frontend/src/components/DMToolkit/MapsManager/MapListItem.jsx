import React from 'react';

const MapListItem = ({ map, isSelected, onSelect, onUpdate, onDelete }) => {
  const handleNameChange = (e) => {
    const updated = {
      ...map,
      content: {
        ...map.content,
        name: e.target.value
      }
    };
    onUpdate(updated);
  };

  const handleSizeChange = (field, value) => {
    const updated = {
      ...map,
      content: {
        ...map.content,
        [field]: parseInt(value) || 0
      }
    };
    onUpdate(updated);
  };

  return (
    <li
      onClick={() => onSelect(map)}
      style={{ cursor: 'pointer', backgroundColor: isSelected ? '#eef' : 'transparent', padding: '0.5rem' }}
    >
      <input
        type="text"
        value={map.content.name}
        onChange={handleNameChange}
        placeholder="Map Name"
      />
      <input
        type="number"
        value={map.content.width}
        onChange={(e) => handleSizeChange('width', e.target.value)}
        placeholder="Width"
      />
      <input
        type="number"
        value={map.content.height}
        onChange={(e) => handleSizeChange('height', e.target.value)}
        placeholder="Height"
      />
      <button onClick={(e) => {
          e.stopPropagation(); // Prevent triggering map selection
          onDelete(map._id);
        }} style={{ marginLeft: '1rem', color: 'red' }}>
          ❌
        </button>
    </li>
  );
};

export default MapListItem;
