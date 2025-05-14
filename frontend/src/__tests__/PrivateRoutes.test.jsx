import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import PrivateRoute from "../components/Auth/PrivateRoute";
import { UserContext } from "../context/UserContext";

// Mock Navigate component
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }) => <div>Redirected to {to}</div>,
  };
});

const renderWithUser = (userValue) => {
  return render(
    <MemoryRouter>
      <UserContext.Provider value={{ user: userValue }}>
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>
      </UserContext.Provider>
    </MemoryRouter>
  );
};

describe("PrivateRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows loading if user is null but token exists", () => {
    localStorage.setItem("token", "some-token");
    renderWithUser(null);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to home if user is not authenticated", () => {
    renderWithUser({});
    expect(screen.getByText("Redirected to /")).toBeInTheDocument();
  });

  it("renders children if user has valid token", () => {
    renderWithUser({ token: "abc123" });
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  // Edge Case 1: user is undefined
  it("redirects to home if user is undefined", () => {
    renderWithUser(undefined);
    expect(screen.getByText("Redirected to /")).toBeInTheDocument();
  });

  // Edge Case 2: user has falsy token
  it("redirects to home if token is falsy", () => {
    renderWithUser({ token: "" });
    expect(screen.getByText("Redirected to /")).toBeInTheDocument();
  });
});
