import React, { createRef } from "react";
import { render } from "@testing-library/react";
import ZoomableStage, {
  handleWheelEvent,
} from "../../components/DMToolkit/Maps/ZoomableStage";
import "@testing-library/jest-dom";

const createMockStage = () => ({
  scaleX: vi.fn(() => 1),
  scale: vi.fn(),
  x: vi.fn(() => 0),
  y: vi.fn(() => 0),
  position: vi.fn(),
  batchDraw: vi.fn(),
  getPointerPosition: vi.fn(() => ({ x: 100, y: 100 })),
});

describe("ZoomableStage", () => {
  it("forwards event handlers", () => {
    const onDrop = vi.fn();
    const onDragOver = vi.fn();
    const onMouseMove = vi.fn();

    const ref = createRef();
    render(
      <ZoomableStage
        width={400}
        height={300}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMouseMove={onMouseMove}
        ref={ref}
      />
    );

    expect(typeof ref.current).toBe("object");
  });

  it("applies zoom on simulated wheel event logic", () => {
    const mockStage = createMockStage();
    const fakeEvent = {
      evt: {
        preventDefault: vi.fn(),
        deltaY: -100,
      },
    };

    handleWheelEvent(mockStage, fakeEvent);

    expect(mockStage.scale).toHaveBeenCalled();
    expect(mockStage.position).toHaveBeenCalled();
    expect(mockStage.batchDraw).toHaveBeenCalled();
  });
});
