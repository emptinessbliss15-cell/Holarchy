import { LocalStorageAdapter } from "./LocalStorageAdapter.js";

let adapter = new LocalStorageAdapter();

export function useStorage(nextAdapter) {
  if (!nextAdapter) throw new TypeError("A storage adapter is required.");
  adapter = nextAdapter;
  return storage;
}

export const storage = {
  list: () => adapter.list(),
  get: id => adapter.get(id),
  has: id => adapter.has(id),
  put: item => adapter.put(item),
  delete: id => adapter.delete(id)
};
