import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import MapCreationForm from "../../components/DMToolkit/MapsManager/MapCreationForm";
import "@testing-library/jest-dom";

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => "blob:preview-url");
});

describe("MapCreationForm", () => {
  const mockSubmit = vi.fn();
  const mockImageUpload = vi.fn(() => Promise.resolve("/fake/image/url.png"));

  beforeEach(() => {
    mockSubmit.mockClear();
    mockImageUpload.mockClear();
  });

  it("renders all input fields and button", () => {
    render(
      <MapCreationForm onSubmit={mockSubmit} onImageUpload={mockImageUpload} />
    );

    expect(screen.getByPlaceholderText("Map Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Width (squares)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Height (squares)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add map/i })
    ).toBeInTheDocument();
  });

  it("does not submit if any required field is missing", () => {
    render(
      <MapCreationForm onSubmit={mockSubmit} onImageUpload={mockImageUpload} />
    );
    fireEvent.click(screen.getByRole("button", { name: /add map/i }));
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("displays image preview when image is selected", () => {
    render(
      <MapCreationForm onSubmit={mockSubmit} onImageUpload={mockImageUpload} />
    );
    const file = new File(["(⌐□_□)"], "map.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText(/map image/i), {
      target: { files: [file] },
    });

    const preview = screen.getByAltText(/map preview/i);
    expect(preview).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    render(
      <MapCreationForm onSubmit={mockSubmit} onImageUpload={mockImageUpload} />
    );

    const file = new File(["dummy"], "map.png", { type: "image/png" });

    fireEvent.change(screen.getByPlaceholderText("Map Name"), {
      target: { value: "Dungeon" },
    });
    fireEvent.change(screen.getByPlaceholderText("Width (squares)"), {
      target: { value: "20" },
    });
    fireEvent.change(screen.getByPlaceholderText("Height (squares)"), {
      target: { value: "15" },
    });
    fireEvent.change(screen.getByLabelText(/map image/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /add map/i }));

    await waitFor(() => {
      expect(mockImageUpload).toHaveBeenCalledWith(file);
      expect(mockSubmit).toHaveBeenCalledWith({
        name: "Dungeon",
        width: "20",
        height: "15",
        imageUrl: "/fake/image/url.png",
      });
    });
  });
});
