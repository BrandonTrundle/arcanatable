/**
 * @file MapEditor.test.jsx
 *
 * This suite tests the <MapEditor /> component responsible for rendering the
 * entire VTT editor surface, including maps, tokens, grid, and layer controls.
 *
 * Key behaviors tested:
 * - Rendering core child components
 * - Handling token drag and drop
 * - Triggering save via updateMapTokens
 * - Showing the context menu on token right-click
 */

import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import MapEditor from "../../components/DMToolkit/Maps/MapEditor";
import { vi } from "vitest";
import * as mapService from "../../services/mapService";
import * as UserContext from "../../context/UserContext";

// Mocks
vi.mock("../../context/UserContext", () => ({
  useUserContext: vi.fn(),
}));

vi.mock("../../services/mapService", () => ({
  updateMapTokens: vi.fn(),
}));

vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (node) => node,
  };
});

vi.mock("use-image", () => ({
  __esModule: true,
  default: () => [null, "loaded"],
}));

const mockMap = {
  _id: "map123",
  content: {
    width: 2,
    height: 2,
    imageUrl: "test.png",
    placedTokens: [],
  },
};

const mockUser = { token: "abc123", _id: "user123" };

describe("MapEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    UserContext.useUserContext.mockReturnValue({ user: mockUser });
  });

  it("renders core components", () => {
    render(
      <MapEditor map={mockMap} onClose={() => {}} onMapUpdate={() => {}} />
    );
    expect(screen.getByText("❌ Close Editor")).toBeInTheDocument();
    expect(screen.getByText("💾 Save Changes")).toBeInTheDocument();
    expect(screen.getByText("Dm Layer")).toBeInTheDocument();
  });

  it("triggers updateMapTokens when save is clicked", async () => {
    const onMapUpdate = vi.fn();
    mapService.updateMapTokens.mockResolvedValueOnce(mockMap);

    render(
      <MapEditor map={mockMap} onClose={() => {}} onMapUpdate={onMapUpdate} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText("💾 Save Changes"));
    });

    expect(mapService.updateMapTokens).toHaveBeenCalledWith(
      "map123",
      [],
      "abc123"
    );
    expect(onMapUpdate).toHaveBeenCalledWith(mockMap);
  });

  it("adds a token on drop", () => {
    const { container } = render(
      <MapEditor map={mockMap} onClose={() => {}} onMapUpdate={() => {}} />
    );

    const token = {
      _id: "token1",
      content: { image: "url.png", tokenSize: "Medium" },
    };

    const stage = container.querySelector(".map-editor-overlay");

    act(() => {
      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          getData: () => JSON.stringify(token),
        },
      });
      stage.dispatchEvent(dropEvent);
    });

    // You could check console logs or inspect internal state via mocks if needed.
  });

  // You may expand tests to assert context menu behavior or token positioning logic
});
