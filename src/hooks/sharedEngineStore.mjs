export function createSharedStore(initialSnapshot) {
  let snapshot = initialSnapshot;
  const listeners = new Set();

  return {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    publish(patch) {
      snapshot = { ...snapshot, ...patch };
      for (const listener of listeners) listener();
    },
  };
}
