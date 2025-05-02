import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../styles/UserWelcome.css';
import welcomeBackground from '../assets/UserWelcomeBG.png';
import UserInfoCard from '../components/UserInfoCard';
import BlackCrystal from '../assets/BlackCrystal.png';
import BlueCrystal from '../assets/BlueCrystal.png';
import OrangeCrystal from '../assets/OrangeCrystal.png';
import Navbar from '../components/Navbar'; // make sure the path is correct


const userWelcomeStyle = {
  backgroundImage: `url(${welcomeBackground})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  paddingTop: '6rem',
  paddingBottom: '3rem',
  textAlign: 'center',
};

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [rotationAngles, setRotationAngles] = useState({
    campaign: 0,
    character: 0,
    learn: 0,
  });

  const rotationRef = useRef({});

  const startSpinning = (key) => {
    const spin = () => {
      setRotationAngles((prev) => ({
        ...prev,
        [key]: (prev[key] + 2) % 360,
      }));
      rotationRef.current[key] = requestAnimationFrame(spin);
    };
    rotationRef.current[key] = requestAnimationFrame(spin);
  };

  const stopSpinning = (key) => {
    cancelAnimationFrame(rotationRef.current[key]);
  };

  if (!user) {
    return (
      <div className="user-welcome-loading">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div style={userWelcomeStyle}>
      <div className="user-info-card-wrapper">
        <UserInfoCard
          user={user}
          memberSince={user.createdAt}
          hoursPlayed={user.hoursPlayed || 0}
        />
      </div>

      <h1 className="user-welcome-title">Welcome back, {user.username}!</h1>
      <p className="user-welcome-subtitle">
        {user.onboarding?.rolePreference === 'GM'
          ? 'Ready to guide your next great story?'
          : user.onboarding?.rolePreference === 'Player'
          ? 'Time to jump into the action.'
          : 'Whether you run games or play them — ArcanaTable is ready.'}
      </p>

      <div className="user-welcome-actions">
        {/* Campaign Tile */}
        <div
          className="welcome-tile"
          onClick={() => navigate('/campaigns')}
          onMouseEnter={() => startSpinning('campaign')}
          onMouseLeave={() => stopSpinning('campaign')}
        >
          <div className="tile-content">
            <div className="tile-text">
              <h2>Campaigns</h2>
              <p>Manage your adventures, story arcs, and maps.</p>
            </div>
            <img
              src={BlackCrystal}
              alt="Black Crystal"
              className="tile-crystal"
              style={{ transform: `rotate(${rotationAngles.campaign}deg)` }}
            />
          </div>
        </div>

        {/* Character Tile */}
        <div
          className="welcome-tile"
          onClick={() => navigate('/characters')}
          onMouseEnter={() => startSpinning('character')}
          onMouseLeave={() => stopSpinning('character')}
        >
          <div className="tile-content">
            <div className="tile-text">
              <h2>Characters</h2>
              <p>Create and manage your party members and NPCs.</p>
            </div>
            <img
              src={OrangeCrystal}
              alt="Orange Crystal"
              className="tile-crystal"
              style={{ transform: `rotate(${rotationAngles.character}deg)` }}
            />
          </div>
        </div>
        

        {/* Learn Tile */}
        <div
          className="welcome-tile"
          onMouseEnter={() => startSpinning('learn')}
          onMouseLeave={() => stopSpinning('learn')}
        >
          <div className="tile-content">
            <div className="tile-text">
              <h2>Learn ArcanaTable</h2>
              <p>Explore tutorials, tips, and feature highlights.</p>
            </div>
            <img
              src={BlueCrystal}
              alt="Blue Crystal"
              className="tile-crystal"
              style={{ transform: `rotate(${rotationAngles.learn}deg)` }}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
