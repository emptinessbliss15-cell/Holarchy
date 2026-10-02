export class MemoryAdapter {
  constructor(items = []) { this.items = new Map(items.map(item => [item.id, item])); }
  async start() { return this; }
  async stop() {}
  list() { return [...this.items.values()]; }
  get(id) { return this.items.get(id) ?? null; }
  has(id) { return this.items.has(id); }
  put(item) { this.items.set(item.id, item); return item; }
  delete(id) { return this.items.delete(id); }
}
