export interface SharedStore<T extends object> {
  getSnapshot(): T;
  subscribe(listener: () => void): () => void;
  publish(patch: Partial<T>): void;
}
export declare function createSharedStore<T extends object>(initialSnapshot: T): SharedStore<T>;
