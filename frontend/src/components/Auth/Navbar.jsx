import React, { useState, useContext } from "react";
import axios from "axios";
import "../../styles/Navbar.css";
import logo from "../../assets/ArcanaTableLogo.png";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );

      const { token } = res.data;

      localStorage.setItem("token", token);

      // ✅ Fetch full user profile after login
      const userDetails = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser({ ...userDetails.data, token });

      // ✅ Route based on onboardingComplete
      if (userDetails.data.onboardingComplete) {
        navigate("/dashboard");
      } else {
        navigate("/user-onboarding");
      }

      setEmail("");
      setPassword("");
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
      alert("Login failed.");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="ArcanaTable Logo" />
      </div>

      <div className="navbar-links">
        {user ? (
          <a onClick={() => navigate("/dashboard")}>Dashboard</a>
        ) : (
          <a href="#">Play Now</a>
        )}
        {/* Join a Game is removed */}
        <button className="navbar-button">Marketplace ▾</button>
        <button className="navbar-button">Tools ▾</button>
        <button className="navbar-button">Community ▾</button>
      </div>

      <div className="navbar-user">
        {!user ? (
          <>
            <button
              className="sign-in-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              Sign In ▾
            </button>

            {menuOpen && (
              <div className="sign-in-form">
                <form onSubmit={handleLogin}>
                  <div>
                    <label htmlFor="email">Email address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit">Sign in</button>
                </form>

                <div className="signin-links">
                  <button type="button" onClick={() => navigate("/signup")}>
                    New to ArcanaTable? Sign up
                  </button>
                  <button type="button" disabled>
                    Forgot password?
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="user-info">
            <span>🧙 Logged In</span>
            <button onClick={logout} className="sign-out">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
