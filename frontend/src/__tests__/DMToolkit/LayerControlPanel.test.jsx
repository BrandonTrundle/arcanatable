/**
 * @file LayerControlPanel.test.jsx
 *
 * This test suite validates the behavior of the <LayerControlPanel /> component,
 * a draggable overlay used in the MapEditor to switch between DM, Player, and Event token layers.
 *
 * Tests include:
 * - Rendering the correct layer buttons
 * - Triggering the `onLayerChange` callback when buttons are clicked
 * - Verifying the default drag-start position
 * - (Optional) Simulating drag behavior is skipped for simplicity
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LayerControlPanel from "../../components/DMToolkit/Maps/LayerControlPanel";

describe("LayerControlPanel", () => {
  const setup = (props = {}) => {
    const onLayerChange = vi.fn();
    render(
      <LayerControlPanel
        activeLayer="dm"
        onLayerChange={onLayerChange}
        {...props}
      />
    );
    return { onLayerChange };
  };

  it("renders all layer buttons", () => {
    setup();
    expect(screen.getByText("Dm Layer")).toBeInTheDocument();
    expect(screen.getByText("Player Layer")).toBeInTheDocument();
    expect(screen.getByText("Event Layer")).toBeInTheDocument();
  });

  it("calls onLayerChange with correct value when a button is clicked", () => {
    const { onLayerChange } = setup();

    fireEvent.click(screen.getByText("Player Layer"));
    expect(onLayerChange).toHaveBeenCalledWith("player");

    fireEvent.click(screen.getByText("Event Layer"));
    expect(onLayerChange).toHaveBeenCalledWith("event");

    fireEvent.click(screen.getByText("Dm Layer"));
    expect(onLayerChange).toHaveBeenCalledWith("dm");
  });

  it("renders at default starting position", () => {
    const panel = render(
      <LayerControlPanel activeLayer="dm" onLayerChange={() => {}} />
    ).container.querySelector(".layer-control-panel");

    expect(panel.style.left).toBe("20px");
    expect(panel.style.top).toBe("20px");
  });
});
