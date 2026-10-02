import { storage } from "./components/storage/storage.js";

export function createNode({ name, type = "node" }) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    type,
    createdAt: now,
    updatedAt: now
  };
}

export function listNodes() {
  return storage.list();
}

export function getNode(id) {
  return storage.get(id);
}

export function addNode(input) {
  return storage.put(createNode(input));
}

export function removeNode(id) {
  return storage.delete(id);
}
