import React, { useState } from 'react';
import '../styles/DMToolkit.css';
import WizardsTower from '../assets/WizardsTower.png';
import MonsterManager from '../components/DMToolkit/MonsterManager'; 
import NPCManager from '../components/DMToolkit/NPCManager'; 


const DMToolkit = () => {
  const [activeTool, setActiveTool] = useState('monsters'); // default to monsters

  const toolList = [
    { key: 'all', label: '📜 All' },
    { key: 'monsters', label: '👹 Monsters' },
    { key: 'npcs', label: '🧙 NPCs' },
    { key: 'potions', label: '🧪 Potions' },
    { key: 'items', label: '📦 Items' },
    { key: 'maps', label: '🗺️ Maps' },
    { key: 'world', label: '📖 World' },
    { key: 'rules', label: '⚙️ Custom Rules' },
    { key: 'tokens', label: '🧩 Tokens' },
    { key: 'cheatsheet', label: '📝 Cheat Sheet' }
  ];

  return (
    <div
      className="dm-toolkit-wrapper"
      style={{ backgroundImage: `url(${WizardsTower})` }}
    >
      <div className="dm-toolkit-container">
        <aside className="dm-sidebar">
          <h2>DM Toolkit</h2>
          <ul className="dm-nav-list">
            {toolList.map(tool => (
              <li
                key={tool.key}
                onClick={() => setActiveTool(tool.key)}
                style={{
                  fontWeight: activeTool === tool.key ? 'bold' : 'normal',
                  textDecoration: activeTool === tool.key ? 'underline' : 'none'
                }}
              >
                {tool.label}
              </li>
            ))}
          </ul>
        </aside>

        <main className="dm-main">
        {activeTool === 'monsters' && <MonsterManager />}
        {activeTool === 'npcs' && <NPCManager />}
        </main>
      </div>
    </div>
  );
};

export default DMToolkit;
