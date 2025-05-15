import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MapsManager from "../../components/DMToolkit/MapsManager/MapsManager";
import * as mapService from "../../services/mapService";
import * as UserContext from "../../context/UserContext";
import axios from "axios";
import { vi } from "vitest";

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(
    () => "blob:http://localhost/fake-object-url"
  );
});
// Mock external dependencies
vi.mock("axios");
vi.mock("../../services/mapService", () => ({
  uploadMapImage: vi.fn(),
  saveMap: vi.fn(),
  updateMap: vi.fn(),
}));

vi.mock("../../components/DMToolkit/Maps/MapEditor", () => ({
  __esModule: true,
  default: () => <div data-testid="map-editor">MapEditor</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(UserContext, "useUserContext").mockReturnValue({
    user: { token: "mockToken", _id: "user1" },
  });
});

const mockMaps = [
  {
    _id: "map1",
    toolkitType: "Map",
    content: { name: "Map A", width: 10, height: 10 },
  },
];

const mockCampaigns = [
  { _id: "camp1", name: "Dragonfall", creator: "user1" },
  { _id: "camp2", name: "Ghosts", creator: "someoneElse" },
];

describe("<MapsManager />", () => {
  it("displays maps and owned campaigns", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/dmtoolkit"))
        return Promise.resolve({ data: mockMaps });
      if (url.includes("/api/campaigns"))
        return Promise.resolve({ data: mockCampaigns });
    });

    render(<MapsManager />);

    expect(await screen.findByText("🗺️ Map Manager")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Map A")).toBeInTheDocument();

    const campaignOptions = screen.getAllByRole("option", {
      name: "Dragonfall",
    });
    expect(campaignOptions).toHaveLength(2);
    expect(screen.queryByText("Ghosts")).not.toBeInTheDocument();
  });

  it("adds a new map with valid input", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/campaigns"))
        return Promise.resolve({ data: mockCampaigns });
      if (url.includes("/api/dmtoolkit")) return Promise.resolve({ data: [] });
    });

    const newMap = {
      _id: "map2",
      toolkitType: "Map",
      content: { name: "New Map", width: 20, height: 20, imageUrl: "img.png" },
    };

    mapService.uploadMapImage.mockResolvedValue("img.png");
    mapService.saveMap.mockResolvedValue(newMap);

    render(<MapsManager />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "camp1" },
    });

    fireEvent.change(screen.getByPlaceholderText("Map Name"), {
      target: { value: "New Map" },
    });
    fireEvent.change(screen.getByPlaceholderText("Width (squares)"), {
      target: { value: 20 },
    });
    fireEvent.change(screen.getByPlaceholderText("Height (squares)"), {
      target: { value: 20 },
    });

    // Simulate file upload
    const file = new File(["dummy"], "map.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Map Image"), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByText("➕ Add Map"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("New Map")).toBeInTheDocument();
    });
  });

  it("shows the MapEditor when a map is selected", async () => {
    axios.get.mockResolvedValue({ data: mockMaps });

    render(<MapsManager />);
    fireEvent.click(await screen.findByDisplayValue("Map A"));

    expect(await screen.findByTestId("map-editor")).toBeInTheDocument();
  });

  it("removes a map when deleted", async () => {
    axios.get.mockResolvedValue({ data: mockMaps });
    axios.delete.mockResolvedValue({});

    render(<MapsManager />);
    fireEvent.click(await screen.findByText("❌"));

    await waitFor(() => {
      expect(screen.queryByDisplayValue("Map A")).not.toBeInTheDocument();
    });
  });
});
