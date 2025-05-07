import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UserOnboarding from "./pages/UserOnboarding";
import MessagePage from "./pages/Messages/MessagePage";
import DMToolkit from "./pages/DMToolkit";

import CharacterDashboard from "./pages/CharacterDashboard";
import CharacterCreate from "./pages/CharacterCreate";
import CharacterEdit from "./pages/CharacterEdit";

import CampaignDashboard from "./pages/CampaignDashboard";
import CreateCampaign from "./pages/CreateCampaign";
import JoinCampaign from "./pages/JoinCampaign";

import PrivateRoute from "./components/Auth/PrivateRoute";
import RequireOnboarding from "./components/Auth/RequireOnboarding";

function TokenHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard");
    }
  }, [location, navigate]);

  return null;
}

const App = () => (
  <Router>
    <TokenHandler />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/user-onboarding"
        element={
          <PrivateRoute>
            <UserOnboarding />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <RequireOnboarding>
              <Dashboard />
            </RequireOnboarding>
          </PrivateRoute>
        }
      />

      <Route
        path="/dm-toolkit"
        element={
          <PrivateRoute>
            <RequireOnboarding>
              <DMToolkit />
            </RequireOnboarding>
          </PrivateRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <RequireOnboarding>
              <MessagePage />
            </RequireOnboarding>
          </PrivateRoute>
        }
      />

      <Route
        path="/characters"
        element={
          <PrivateRoute>
            <RequireOnboarding>
              <CharacterDashboard />
            </RequireOnboarding>
          </PrivateRoute>
        }
      />

      <Route
        path="/characters/create"
        element={
          <PrivateRoute>
            <RequireOnboarding>
              <CharacterCreate />
            </RequireOnboarding>
          </PrivateRoute>
        }
      />

      <Route
        path="/characters/:id/edit"
        element={
          <PrivateRoute>
            <RequireOnboarding>
              <CharacterEdit />
            </RequireOnboarding>
          </PrivateRoute>
        }
      />

      <Route
        path="/campaigns"
        element={
          <PrivateRoute>
            <RequireOnboarding>
              <CampaignDashboard />
            </RequireOnboarding>
          </PrivateRoute>
        }
      />

      <Route
        path="/campaigns/create"
        element={
          <PrivateRoute>
            <RequireOnboarding>
              <CreateCampaign />
            </RequireOnboarding>
          </PrivateRoute>
        }
      />

      <Route
        path="/campaigns/join"
        element={
          <PrivateRoute>
            <RequireOnboarding>
              <JoinCampaign />
            </RequireOnboarding>
          </PrivateRoute>
        }
      />
    </Routes>
  </Router>
);

export default App;
