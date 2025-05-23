export function calculateDistance(from, to, cellSize) {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);

  const cellsX = Math.round(dx / cellSize);
  const cellsY = Math.round(dy / cellSize);

  const diagonalSteps = Math.min(cellsX, cellsY);
  const straightSteps = Math.abs(cellsX - cellsY);

  return diagonalSteps * 10 + straightSteps * 5;
}
