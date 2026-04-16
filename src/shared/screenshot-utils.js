/**
 * Calculates the scroll positions needed to capture a full-page screenshot.
 * Each position represents a viewport-height step, with the final position
 * ensuring the very bottom of the page is captured.
 */
export function calculateScrollPositions(scrollHeight, viewportHeight) {
  if (viewportHeight <= 0 || scrollHeight <= 0) {
    return [0];
  }

  if (scrollHeight <= viewportHeight) {
    return [0];
  }

  const positions = [];

  for (let y = 0; y < scrollHeight - viewportHeight; y += viewportHeight) {
    positions.push(y);
  }

  positions.push(scrollHeight - viewportHeight);

  return positions;
}
