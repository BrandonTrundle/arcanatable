import React from "react";

const GoogleLoginButton = () => {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return <button onClick={handleLogin}>Sign in with Google</button>;
};

export default GoogleLoginButton;
