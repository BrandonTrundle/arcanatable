import "@testing-library/jest-dom";
import { createCanvas } from "canvas";

// Provide a mock for HTMLCanvasElement so Konva doesn't crash in tests
Object.defineProperty(global, "HTMLCanvasElement", {
  value: createCanvas().constructor,
});
