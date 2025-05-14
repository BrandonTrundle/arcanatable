import React from "react";
import { render, screen } from "@testing-library/react";
import UserInfoCard from "../components/Auth/UserInfoCard";

// Mocking the `useNavigate` hook from `react-router-dom`
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

globalThis.import = {
  meta: { env: { VITE_API_URL: "http://localhost:5000" } },
};

describe("UserInfoCard", () => {
  const mockUser = {
    username: "TestUser",
    avatarUrl: "/uploads/avatars/test.png",
    subscriptionTier: "Premium",
  };

  it("renders the user's name, tier, and avatar", () => {
    render(
      <UserInfoCard
        user={mockUser}
        memberSince="2023-01-01T00:00:00.000Z"
        hoursPlayed={42}
        hasUnseenNotifications={true}
        hasUnseenMessages={true}
      />
    );

    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText(/Tier: Premium/i)).toBeInTheDocument();
    expect(screen.getByAltText("User Avatar")).toBeInTheDocument();
  });
});
