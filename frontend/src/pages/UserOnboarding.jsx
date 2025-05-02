import React, { useState, useContext } from 'react';
import '../styles/UserOnboarding.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import onboardArt from '../assets/FantasyMapBackground.png';

const UserOnboarding = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rolePreference: 'Player',
    theme: 'Light',
    experienceLevel: 'Beginner',
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    try {
      await axios.patch(
        'http://localhost:5000/api/users/onboarding',
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
  
      // Update local user context so routing guards pass
      setUser((prev) => ({
        ...prev,
        onboarding: formData,
        onboardingComplete: true,
      }));
  
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Something went wrong.');
    }
  };

  return (
    <div className="onboarding-overlay">
      {/* Background Layer */}
      <div
        className="onboarding-bg"
        style={{
          backgroundImage: `url(${onboardArt})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
  
      {/* Foreground Form Container */}
      <div className="onboarding-container onboarding-fade">
        <h2 className="onboarding-title">Welcome to ArcanaTable!</h2>
        <p className="onboarding-subtitle">Let's personalize your experience.</p>
  
        <form className="onboarding-form" onSubmit={handleSubmit}>

  
          <label>
            Role Preference:
            <select name="rolePreference" value={formData.rolePreference} onChange={handleChange}>
              <option value="Player">Player</option>
              <option value="GM">GM</option>
              <option value="Both">Both</option>
            </select>
          </label>
  
          <label>
            Theme:
            <select name="theme" value={formData.theme} onChange={handleChange}>
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
              <option value="Parchment">Parchment</option>
            </select>
          </label>
  
          <label>
            Experience Level:
            <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </label>
  

  
          {error && <p className="onboarding-error">{error}</p>}
  
          <div className="onboarding-buttons">
            <button type="submit">Complete Onboarding</button>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default UserOnboarding;
