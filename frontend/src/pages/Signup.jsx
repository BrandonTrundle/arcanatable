import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; // Adjust path as needed
import axios from 'axios';
import '../styles/Signup.css';
import fantasyMap from '../assets/FantasyMapBackground.png';

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletter: false,
    terms: false,
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    if (!form.terms) {
      setMessage('You must agree to the terms of service.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', {
        username: form.username,
        email: form.email,
        password: form.password
      });

      const { token } = res.data;
      if (token) {
        localStorage.setItem('token', token);
      
        // ✅ Fetch full user profile
        const userDetails = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
      
        setUser({ ...userDetails.data, token });
        navigate('/user-onboarding');
      } else {
        setMessage('Signup succeeded but no token returned.');
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Signup failed. Try again.');
    }
  };

  return (
    <div className="signup-page" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
    <div
      className="signup-page-bg"
      style={{
        backgroundImage: `url(${fantasyMap})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />

      <div className="signup-container" style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="signup-title">Create your ArcanaTable account</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label>Username</label>
            <input
              name="username"
              type="text"
              required
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email address</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="form-checkbox">
            <input
              name="newsletter"
              type="checkbox"
              checked={form.newsletter}
              onChange={handleChange}
            />
            <label>Subscribe to newsletter</label>
          </div>

          <div className="form-checkbox">
            <input
              name="terms"
              type="checkbox"
              required
              checked={form.terms}
              onChange={handleChange}
            />
            <label>
              I agree to the <a href="#">terms of service</a>.
            </label>
          </div>

          <button type="submit" className="signup-button">
            Create Account
          </button>

          {message && <div className="signup-message">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default Signup;
