/**
 * @file GridOverlay.test.jsx
 *
 * This test suite verifies the behavior of the <GridOverlay /> component,
 * which is responsible for rendering a grid of lines over a virtual tabletop map.
 *
 * The grid is composed of vertical and horizontal lines generated using <Line />
 * components from react-konva. Each line's position is calculated based on the
 * `width`, `height`, and `cellSize` props passed to the component.
 *
 * To avoid relying on canvas rendering and simplify testing, <Line /> is mocked
 * as a simple <div> element with data attributes representing its key props.
 *
 * Tests included:
 * - Verifying the total number of vertical and horizontal lines rendered
 * - Confirming vertical lines are placed at correct x-axis intervals
 * - Confirming horizontal lines are placed at correct y-axis intervals
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import GridOverlay from "../../components/DMToolkit/Maps/GridOverlay";
import { vi } from "vitest";

// Mock react-konva's Line component
vi.mock("react-konva", () => ({
  Line: ({ points, stroke }) => (
    <div
      data-testid="line"
      data-points={points.join(",")}
      data-stroke={stroke}
    />
  ),
}));

describe("GridOverlay", () => {
  const width = 3;
  const height = 2;
  const cellSize = 50;

  it("renders the correct number of vertical and horizontal lines", () => {
    render(<GridOverlay width={width} height={height} cellSize={cellSize} />);
    const lines = screen.getAllByTestId("line");
    expect(lines.length).toBe(width + 1 + (height + 1)); // vertical + horizontal
  });

  it("creates vertical lines at correct x positions", () => {
    render(<GridOverlay width={width} height={height} cellSize={cellSize} />);
    const verticalLines = screen
      .getAllByTestId("line")
      .filter((line) => line.getAttribute("data-stroke") === "red");
    verticalLines.forEach((line, i) => {
      const points = line.getAttribute("data-points").split(",").map(Number);
      expect(points[0]).toBe(i * cellSize);
      expect(points[2]).toBe(i * cellSize);
    });
  });

  it("creates horizontal lines at correct y positions", () => {
    render(<GridOverlay width={width} height={height} cellSize={cellSize} />);
    const horizontalLines = screen
      .getAllByTestId("line")
      .filter((line) => line.getAttribute("data-stroke") === "blue");
    horizontalLines.forEach((line, i) => {
      const points = line.getAttribute("data-points").split(",").map(Number);
      expect(points[1]).toBe(i * cellSize);
      expect(points[3]).toBe(i * cellSize);
    });
  });
});
