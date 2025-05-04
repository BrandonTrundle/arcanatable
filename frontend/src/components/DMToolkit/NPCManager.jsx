import React, { useEffect, useState, useRef } from 'react';
import NPCForm from './NPCForm';
import NPCPreview from './NPCPreview';
import '../../styles/NPCManager.css';
import {
  fetchNPCs,
  createNPC,
  updateNPC,
  deleteNPC
} from '../../services/npcService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const dummyCampaigns = ['The Crimson Pact', 'Storm of Embers', 'Hollowreach', 'Sunken Vale'];

const defaultNPC = {
  name: '',
  race: '',
  class: '',
  gender: '',
  age: '',
  alignment: '',
  background: '',
  occupation: '',
  tokenSize: '',
  armorClass: '',
  hitPoints: '',
  hitDice: '',
  speed: '',
  proficiencyBonus: '',
  challengeRating: '',
  languages: [],
  abilityScores: { str: '', dex: '', con: '', int: '', wis: '', cha: '' },
  savingThrows: {},
  skills: {},
  senses: { passivePerception: '' },
  damageResistances: [],
  conditionImmunities: [],
  traits: [],
  actions: [],
  spells: { cantrips: [], level1: [] },
  description: '',
  image: '',
  campaigns: [],
  toolkitType: 'NPC'
};

const NPCManager = () => {
  const [npcs, setNpcs] = useState([]);
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const previewRef = useRef();

  useEffect(() => {
    fetchNPCs()
      .then(data => {
        const unpacked = data.map(item => ({
          _id: item._id,
          ...item.content,
          campaigns: item.content.campaigns || []
        }));
        setNpcs(unpacked);
      })
      .catch(console.error);
  }, []);

  const handleCreate = async (npc) => {
    const created = await createNPC(npc);
    setNpcs(prev => [...prev, { _id: created._id, ...created.content }]);
    resetForm();
  };

  const handleUpdate = async (updatedNPC) => {
    const updated = await updateNPC(updatedNPC._id, updatedNPC);
    setNpcs(prev =>
      prev.map(n => (n._id === updated._id ? { _id: updated._id, ...updated.content } : n))
    );
    resetForm();
  };

  const handleDelete = async (id) => {
    await deleteNPC(id);
    setNpcs(prev => prev.filter(n => n._id !== id));
    if (selectedNPC && selectedNPC._id === id) resetForm();
  };

  const handleEditClick = (npc) => {
    setSelectedNPC(npc);
    setIsFormOpen(true);
    setIsEditing(true);
  };

  const handleNewClick = () => {
    setSelectedNPC({ ...defaultNPC });
    setIsFormOpen(true);
    setIsEditing(false);
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setSelectedNPC(null);
    setIsEditing(false);
  };

  const assignCampaign = (npcId, campaignName) => {
    setNpcs(prev =>
      prev.map(npc => {
        if (npc._id !== npcId) return npc;
        const alreadyAssigned = npc.campaigns?.includes(campaignName);
        const updated = {
          ...npc,
          campaigns: alreadyAssigned
            ? npc.campaigns
            : [...(npc.campaigns || []), campaignName]
        };
        handleUpdate(updated);
        return updated;
      })
    );
  };

  const removeCampaign = (npcId, campaignName) => {
    setNpcs(prev =>
      prev.map(npc => {
        if (npc._id !== npcId) return npc;
        const updated = {
          ...npc,
          campaigns: npc.campaigns.filter(c => c !== campaignName)
        };
        handleUpdate(updated);
        return updated;
      })
    );
  };

  const handleExportPDF = async () => {
    if (!selectedNPC || !previewRef.current) return;
  
    const pdf = new jsPDF('p', 'pt', 'a4');
  
    await pdf.html(previewRef.current, {
      margin: 20,
      autoPaging: true,
      html2canvas: {
        scale: 0.8,
        useCORS: true
      },
      callback: () => pdf.save(`${selectedNPC.name || 'npc'}.pdf`)
    });
  };
  

  return (
    <div className="npc-manager-container">
      <div className="npc-manager-header">
        <h3>Saved NPCs</h3>
        <button onClick={handleNewClick}>+ New NPC</button>
      </div>

      {npcs.length === 0 ? (
        <p>No NPCs yet.</p>
      ) : (
        <ul className="npc-list">
          {npcs.map(npc => (
            <li key={npc._id} className="npc-list-item">
              <div className="npc-info">
                <span
                  className="npc-name"
                  onClick={() => setSelectedNPC(npc)}
                >
                  {npc.name}
                </span>
                <select
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected) assignCampaign(npc._id, selected);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Assign to Campaign</option>
                  {dummyCampaigns.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>

                {npc.campaigns?.length > 0 && (
                  <ul className="assigned-campaigns">
                    {npc.campaigns.map((camp, idx) => (
                      <li key={idx}>
                        {camp}
                        <button
                          className="remove-campaign-btn"
                          onClick={() => removeCampaign(npc._id, camp)}
                          title={`Remove ${camp}`}
                        >
                          ✖
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="npc-actions">
                  <button className="edit-btn" onClick={() => handleEditClick(npc)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(npc._id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedNPC && (
        <>
          <button onClick={handleExportPDF} className="export-pdf-btn">📄 Export to PDF</button>
          <div ref={previewRef}>
            <NPCPreview data={selectedNPC} />
          </div>
        </>
      )}

      {isFormOpen && selectedNPC && (
        <NPCForm
          npc={selectedNPC}
          setNPC={setSelectedNPC}
          closeForm={resetForm}
          onSubmit={isEditing ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
};

export default NPCManager;
