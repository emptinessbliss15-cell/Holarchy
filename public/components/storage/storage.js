import { MemoryAdapter } from "./MemoryAdapter.js";
import { IndexedDBAdapter } from "./IndexedDBAdapter.js";

const listeners=new Set();
const memory=new MemoryAdapter();
const indexedDBStore=new IndexedDBAdapter();
const enabled={ indexedDB:true, p2p:false, supabase:false };
let ready=false;

function emit(change){ for(const listener of listeners) listener(change); }
function event(type,node,origin="local"){ return { changeId:crypto.randomUUID(), type, node, origin, timestamp:new Date().toISOString() }; }

async function migratePrototypeData(){
  try {
    const old=JSON.parse(localStorage.getItem("holarchy.nodes.v1")||"[]");
    if(!Array.isArray(old)||!old.length) return;
    const existing=new Set((await indexedDBStore.list()).map(x=>x.id));
    for(const node of old) if(node?.id&&!existing.has(node.id)) await indexedDBStore.put(node);
    localStorage.removeItem("holarchy.nodes.v1");
  } catch {}
}

export const storage={
  async start(){
    if(ready) return;
    await memory.start();
    if(enabled.indexedDB){
      await indexedDBStore.start();
      await migratePrototypeData();
      for(const node of await indexedDBStore.list()) memory.put(node);
    }
    ready=true;
    emit({type:"ready",origin:"storage",timestamp:new Date().toISOString()});
  },
  subscribe(listener){ listeners.add(listener); return ()=>listeners.delete(listener); },
  list(){ return memory.list(); },
  get(id){ return memory.get(id); },
  has(id){ return memory.has(id); },
  async put(node,{origin="local"}={}){
    memory.put(node);
    if(enabled.indexedDB) await indexedDBStore.put(node);
    emit(event("put",node,origin));
    return node;
  },
  async delete(id,{origin="local"}={}){
    const node=memory.get(id);
    memory.delete(id);
    if(enabled.indexedDB) await indexedDBStore.delete(id);
    emit(event("delete",node??{id},origin));
    return true;
  },
  async setEnabled(capability,value){
    if(!(capability in enabled)) throw new Error(`Unknown capability: ${capability}`);
    if(capability==="indexedDB" && value && !enabled.indexedDB){
      await indexedDBStore.start();
      for(const node of memory.list()) await indexedDBStore.put(node);
    }
    if(capability==="indexedDB" && !value && enabled.indexedDB) await indexedDBStore.stop();
    enabled[capability]=Boolean(value);
    emit({type:"capability",capability,enabled:enabled[capability],origin:"storage",timestamp:new Date().toISOString()});
  },
  capabilities(){ return {...enabled, memory:true}; }
};
