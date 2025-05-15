import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MapListItem from "../../components/DMToolkit/MapsManager/MapListItem";

const sampleMap = {
  _id: "map1",
  content: {
    name: "Test Map",
    width: 10,
    height: 8,
    campaign: "",
  },
};

const campaigns = [
  { _id: "camp1", name: "The Lost Mine" },
  { _id: "camp2", name: "Curse of Stormfall" },
];

describe("<MapListItem />", () => {
  let onSelect, onUpdate, onDelete;

  beforeEach(() => {
    onSelect = vi.fn();
    onUpdate = vi.fn();
    onDelete = vi.fn();

    render(
      <MapListItem
        map={sampleMap}
        isSelected={false}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        campaigns={campaigns}
      />
    );
  });

  it("renders with correct values", () => {
    expect(screen.getByPlaceholderText("Map Name")).toHaveValue("Test Map");
    expect(screen.getByPlaceholderText("Width")).toHaveValue(10);
    expect(screen.getByPlaceholderText("Height")).toHaveValue(8);
    expect(
      screen.getByDisplayValue("-- Select Campaign --")
    ).toBeInTheDocument();
  });

  it("calls onSelect when list item is clicked", () => {
    fireEvent.click(screen.getByRole("listitem"));
    expect(onSelect).toHaveBeenCalledWith(sampleMap);
  });

  it("calls onUpdate when name changes", () => {
    fireEvent.change(screen.getByPlaceholderText("Map Name"), {
      target: { value: "Updated Name" },
    });
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ name: "Updated Name" }),
      })
    );
  });

  it("calls onUpdate when width changes", () => {
    fireEvent.change(screen.getByPlaceholderText("Width"), {
      target: { value: "20" },
    });
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ width: 20 }),
      })
    );
  });

  it("calls onUpdate when campaign is selected", () => {
    fireEvent.change(screen.getByDisplayValue("-- Select Campaign --"), {
      target: { value: "camp2" },
    });
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ campaign: "camp2" }),
      })
    );
  });

  it("calls onDelete when delete button is clicked", () => {
    fireEvent.click(screen.getByText("❌"));
    expect(onDelete).toHaveBeenCalledWith("map1");
  });

  it("calls onUpdate when save button is clicked", () => {
    fireEvent.click(screen.getByTitle("Save Map Changes"));
    expect(onUpdate).toHaveBeenCalledWith(sampleMap);
  });
});
