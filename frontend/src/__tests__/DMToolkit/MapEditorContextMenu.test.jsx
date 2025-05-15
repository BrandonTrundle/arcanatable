/**
 * @file MapEditorContextMenu.test.jsx
 *
 * Tests for the <MapEditorContextMenu /> component used in the VTT editor to provide
 * contextual actions (resize, assign layer, delete, etc.) for individual tokens.
 */

import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import MapEditorContextMenu from "../../components/DMToolkit/Maps/MapEditorContextMenu";

describe("MapEditorContextMenu", () => {
  const baseContext = {
    tokenId: "token123",
    x: 100,
    y: 200,
    currentSize: "Large",
  };

  it("does not render if contextMenu is null", () => {
    const { container } = render(
      <MapEditorContextMenu
        contextMenu={null}
        onAction={() => {}}
        onClose={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders all action items when mode is null", () => {
    render(
      <MapEditorContextMenu
        contextMenu={{ ...baseContext, mode: null }}
        onAction={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText(/To DM Layer/)).toBeInTheDocument();
    expect(screen.getByText(/To Player Layer/)).toBeInTheDocument();
    expect(screen.getByText(/Token Number/)).toBeInTheDocument();
    expect(screen.getByText(/Edit Size/)).toBeInTheDocument();
    expect(screen.getByText(/Delete Token/)).toBeInTheDocument();
  });

  it("renders dropdown when mode is 'resize'", () => {
    render(
      <MapEditorContextMenu
        contextMenu={{ ...baseContext, mode: "resize" }}
        onAction={() => {}}
        onClose={() => {}}
      />
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("Large");
  });

  it("triggers onAction and onClose when an item is clicked", () => {
    const onAction = vi.fn();
    const onClose = vi.fn();

    render(
      <MapEditorContextMenu
        contextMenu={{ ...baseContext, mode: null }}
        onAction={onAction}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText(/To DM Layer/));
    expect(onAction).toHaveBeenCalledWith("to-dm", "token123");
    expect(onClose).toHaveBeenCalled();
  });

  it("triggers onAction with new size on resize change", () => {
    const onAction = vi.fn();
    const onClose = vi.fn();

    render(
      <MapEditorContextMenu
        contextMenu={{ ...baseContext, mode: "resize" }}
        onAction={onAction}
        onClose={onClose}
      />
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Huge" },
    });

    expect(onAction).toHaveBeenCalledWith("apply-resize", "token123", "Huge");
    expect(onClose).toHaveBeenCalled();
  });
});
