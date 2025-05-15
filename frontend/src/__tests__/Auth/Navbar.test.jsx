import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "../../components/Auth/Navbar";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import axios from "axios";
import { UserContext } from "../../context/UserContext";

// Define the navigate mock *before* it's used in the vi.mock block
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("axios");

const renderWithContext = (
  ui,
  { user = null, setUser = vi.fn(), logout = vi.fn() } = {}
) => {
  return render(
    <BrowserRouter>
      <UserContext.Provider value={{ user, setUser, logout }}>
        {ui}
      </UserContext.Provider>
    </BrowserRouter>
  );
};

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows Sign In button when no user is logged in", () => {
    renderWithContext(<Navbar />);
    expect(screen.getByText("Sign In ▾")).toBeInTheDocument();
  });

  it("shows login form when Sign In is clicked", () => {
    renderWithContext(<Navbar />);
    fireEvent.click(screen.getByText("Sign In ▾"));
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it("calls navigate to /signup when 'Sign up' is clicked", () => {
    renderWithContext(<Navbar />);
    fireEvent.click(screen.getByText("Sign In ▾"));
    fireEvent.click(screen.getByText(/Sign up/i));
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });

  it("shows logged in view and handles logout", () => {
    const mockLogout = vi.fn();
    renderWithContext(<Navbar />, {
      user: { username: "TestUser" },
      logout: mockLogout,
    });

    expect(screen.getByText("🧙 Logged In")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Sign Out"));
    expect(mockLogout).toHaveBeenCalled();
  });

  it("logs in user and navigates based on onboarding status", async () => {
    const mockSetUser = vi.fn();
    axios.post.mockResolvedValueOnce({ data: { token: "123abc" } });
    axios.get.mockResolvedValueOnce({
      data: { username: "Test", onboardingComplete: true },
    });

    renderWithContext(<Navbar />, { setUser: mockSetUser });

    fireEvent.click(screen.getByText("Sign In ▾"));
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByText("Sign in"));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({
        username: "Test",
        onboardingComplete: true,
        token: "123abc",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});
