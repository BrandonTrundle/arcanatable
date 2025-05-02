import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';
import Navbar from '../components/Auth/Navbar';
import heroArt from '../assets/HomePageBackground.png';

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="homepage-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image-wrapper">
          <img
            src={heroArt}
            alt="ArcanaTable Hero Background"
            className="hero-image"
          />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Welcome to ArcanaTable</h1>
          <p className="hero-description">
            Your tabletop adventures await. Discover, create, and play.
          </p>
          <button className="cta-button" onClick={() => navigate('/signup')}>
            Create Free Account
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="feature-item">
            <div className="feature-icon">🎲</div>
            <h3 className="feature-title">Virtual Dice</h3>
            <p className="feature-description">Roll with style and precision.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🗺️</div>
            <h3 className="feature-title">Custom Maps</h3>
            <p className="feature-description">Explore immersive, editable battlemaps.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📚</div>
            <h3 className="feature-title">Narrative Tools</h3>
            <p className="feature-description">Build worlds and stories with ease.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <h2 className="about-title">What is ArcanaTable?</h2>
          <p className="about-description">
            ArcanaTable is a next-generation virtual tabletop for TTRPG players and GMs.
            Designed for creativity, immersion, and seamless game flow.
          </p>
        </div>
      </section>

      {/* Preview Section */}
      <section className="preview-section">
        <div className="preview-container">
          <h2 className="preview-title">Live Campaign Preview</h2>
          <div className="map-placeholder">[ Map Preview Placeholder ]</div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Get Started?</h2>
        <p className="cta-description">Join thousands of adventurers on ArcanaTable.</p>
        <button className="cta-button" onClick={() => navigate('/signup')}>
          Sign up now for free
        </button>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <p className="footer-text">© 2025 ArcanaTable. All rights reserved.</p>
        <div className="footer-links">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Use</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
