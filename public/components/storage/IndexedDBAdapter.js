export class IndexedDBAdapter {
  constructor({ dbName = "holarchy", storeName = "nodes" } = {}) { this.dbName=dbName; this.storeName=storeName; this.db=null; }
  async start() {
    if (this.db) return this;
    this.db = await new Promise((resolve,reject) => {
      const request=indexedDB.open(this.dbName,1);
      request.onupgradeneeded=()=>{ if(!request.result.objectStoreNames.contains(this.storeName)) request.result.createObjectStore(this.storeName,{keyPath:"id"}); };
      request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error);
    });
    return this;
  }
  async stop(){ this.db?.close(); this.db=null; }
  store(mode="readonly"){ if(!this.db) throw new Error("IndexedDB adapter is not started."); return this.db.transaction(this.storeName,mode).objectStore(this.storeName); }
  request(request){ return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}); }
  async list(){ return this.request(this.store().getAll()); }
  async get(id){ return (await this.request(this.store().get(id))) ?? null; }
  async has(id){ return (await this.get(id)) !== null; }
  async put(item){ await this.request(this.store("readwrite").put(item)); return item; }
  async delete(id){ await this.request(this.store("readwrite").delete(id)); return true; }
}
