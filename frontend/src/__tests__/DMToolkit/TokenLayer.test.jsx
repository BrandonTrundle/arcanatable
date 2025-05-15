import React from "react";
import { render } from "@testing-library/react";
import { Stage, Layer } from "react-konva";
import { Token } from "../../components/DMToolkit/Maps/TokenLayer";
import TokenLayer from "../../components/DMToolkit/Maps/TokenLayer";
import "@testing-library/jest-dom";

// Mock useImage to return null image to avoid drawImage errors in jsdom
vi.mock("use-image", () => ({
  default: () => [null, null],
}));

const dummyToken = {
  id: "token1",
  x: 100,
  y: 150,
  imageUrl: "test.png",
  title: "Test Token",
  size: "Large",
  layer: "player",
};

describe("Token component", () => {
  it("renders within a Konva Stage", () => {
    const { container } = render(
      <Stage width={500} height={500}>
        <Layer>
          <Token
            {...dummyToken}
            activeLayer="dm"
            onDragEnd={() => {}}
            onRightClick={() => {}}
            onClick={() => {}}
            draggable={true}
          />
        </Layer>
      </Stage>
    );
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });
});

describe("TokenLayer", () => {
  it("renders multiple tokens in a stage", () => {
    const tokens = [
      { ...dummyToken, id: "token1" },
      { ...dummyToken, id: "token2", x: 200 },
    ];
    const { container } = render(
      <Stage width={500} height={500}>
        <Layer>
          <TokenLayer
            tokens={tokens}
            onDragEnd={() => {}}
            onRightClick={() => {}}
            onClick={() => {}}
            activeLayer="dm"
          />
        </Layer>
      </Stage>
    );

    expect(container.querySelector("canvas")).toBeInTheDocument();
  });
});
