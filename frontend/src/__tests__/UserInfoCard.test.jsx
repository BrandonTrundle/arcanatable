import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserInfoCard from "../components/Auth/UserInfoCard";
import { vi } from "vitest";

// Mocks
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.stubGlobal("alert", vi.fn());
vi.stubGlobal("fetch", vi.fn());

const mockUser = {
  username: "TestUser",
  avatarUrl: "/uploads/avatars/test.png",
  subscriptionTier: "Premium",
};

const setup = (props = {}) =>
  render(
    <UserInfoCard
      user={mockUser}
      memberSince="2023-01-01T00:00:00.000Z"
      hoursPlayed={42}
      hasUnseenNotifications={true}
      hasUnseenMessages={true}
      {...props}
    />
  );

describe("UserInfoCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "abc123");
  });

  it("renders user details", () => {
    setup();
    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText(/Tier: Premium/i)).toBeInTheDocument();
    expect(screen.getByText("Member since: 1/1/2023")).toBeInTheDocument();
    expect(screen.getByText("Hours Played: 42")).toBeInTheDocument();
  });

  it("falls back to default avatar on error", () => {
    setup();
    const avatar = screen.getByAltText("User Avatar");
    fireEvent.error(avatar);
    expect(avatar.src).toMatch(/defaultav\.png/);
  });

  it("navigates to /messages on click", () => {
    setup();
    fireEvent.click(screen.getByText("Messages"));
    expect(mockNavigate).toHaveBeenCalledWith("/messages");
  });

  it("displays ringing class on icons when there are unseen messages/notifications", () => {
    const { container } = setup();
    const ringingIcons = container.querySelectorAll(".ringing");
    expect(ringingIcons.length).toBeGreaterThan(0);
  });

  it("shows file input when avatar is clicked", () => {
    const { container } = setup();
    const avatar = screen.getByAltText("User Avatar");
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    fireEvent.click(avatar);
  });

  it("uploads avatar and updates avatarUrl", async () => {
    const mockUrl = "/uploads/avatars/updated.png";
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ avatarUrl: mockUrl }),
    });

    const { container } = setup();
    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(["(⌐□_□)"], "avatar.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const avatar = screen.getByAltText("User Avatar");
      expect(avatar.src).toContain(mockUrl);
    });
  });

  it("defaults avatar if user.avatarUrl is missing", () => {
    render(
      <UserInfoCard
        user={{ ...mockUser, avatarUrl: null }}
        memberSince="2023-01-01T00:00:00.000Z"
        hoursPlayed={0}
      />
    );
    const avatar = screen.getByAltText("User Avatar");
    expect(avatar.src).toMatch(/defaultav\.png/);
  });

  it("handles missing memberSince", () => {
    render(<UserInfoCard user={mockUser} hoursPlayed={10} />);
    expect(screen.getByText("Member since: N/A")).toBeInTheDocument();
  });

  it("shows alert on failed upload", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "Bad request",
    });

    const { container } = setup();
    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(["bad"], "fail.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Avatar upload failed.");
    });
  });
});
