export class LocalStorageAdapter {
  constructor({ namespace = "holarchy.nodes.v1" } = {}) {
    this.namespace = namespace;
  }

  list() {
    try {
      const value = JSON.parse(localStorage.getItem(this.namespace) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  get(id) {
    return this.list().find(item => item.id === id) ?? null;
  }

  has(id) {
    return this.get(id) !== null;
  }

  put(item) {
    const items = this.list();
    const index = items.findIndex(existing => existing.id === item.id);
    if (index === -1) items.push(item);
    else items[index] = item;
    localStorage.setItem(this.namespace, JSON.stringify(items));
    return item;
  }

  delete(id) {
    const before = this.list();
    const after = before.filter(item => item.id !== id);
    localStorage.setItem(this.namespace, JSON.stringify(after));
    return after.length !== before.length;
  }
}
