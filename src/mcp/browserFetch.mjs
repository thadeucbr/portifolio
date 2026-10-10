export function createBrowserFetch(browserWindow) {
  if (!browserWindow || typeof browserWindow.fetch !== "function") {
    throw new TypeError("A browser window with fetch is required.");
  }
  return (input, init) => browserWindow.fetch(input, init);
}
