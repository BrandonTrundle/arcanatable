import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import RequireOnboarding from "../components/Auth/RequireOnboarding";
import { UserContext } from "../context/UserContext";

// Define mockNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }) => <div>Redirected to {to}</div>, // Simulate navigation
  };
});

const renderWithUser = (userValue) => {
  return render(
    <MemoryRouter>
      <UserContext.Provider value={{ user: userValue }}>
        <RequireOnboarding>
          <div>Protected Content</div>
        </RequireOnboarding>
      </UserContext.Provider>
    </MemoryRouter>
  );
};

describe("RequireOnboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows loading if user is null but token exists", () => {
    localStorage.setItem("token", "fake-token");
    renderWithUser(null);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to home if user has no token", () => {
    renderWithUser({});
    expect(screen.getByText("Redirected to /")).toBeInTheDocument();
  });

  it("redirects to onboarding if user hasn't completed onboarding", () => {
    renderWithUser({ token: "abc123", onboardingComplete: false });
    expect(
      screen.getByText("Redirected to /user-onboarding")
    ).toBeInTheDocument();
  });

  it("renders children when user is authenticated and onboarded", () => {
    renderWithUser({ token: "abc123", onboardingComplete: true });
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to home if user is undefined", () => {
    renderWithUser(undefined);
    expect(screen.getByText("Redirected to /")).toBeInTheDocument();
  });

  it("redirects to home if user has a falsy token", () => {
    renderWithUser({ token: null, onboardingComplete: true });
    expect(screen.getByText("Redirected to /")).toBeInTheDocument();
  });
});
