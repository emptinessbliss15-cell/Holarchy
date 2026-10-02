import { MemoryAdapter } from "./MemoryAdapter.js";
import { IndexedDBAdapter } from "./IndexedDBAdapter.js";
import { P2PAdapter } from "../sync/P2PAdapter.js";

const listeners=new Set(),memory=new MemoryAdapter(),indexedDBStore=new IndexedDBAdapter(),p2p=new P2PAdapter();
const enabled={indexedDB:true,p2p:false,supabase:false};let ready=false;
function emit(change){for(const listener of listeners)listener(change)}
function event(type,node,origin="local"){return{changeId:crypto.randomUUID(),type,node,origin,timestamp:new Date().toISOString()}}
async function migratePrototypeData(){try{const old=JSON.parse(localStorage.getItem("holarchy.nodes.v1")||"[]");if(!Array.isArray(old)||!old.length)return;const existing=new Set((await indexedDBStore.list()).map(x=>x.id));for(const node of old)if(node?.id&&!existing.has(node.id))await indexedDBStore.put(node);localStorage.removeItem("holarchy.nodes.v1")}catch{}}
async function acceptRemote(change){if(change.type==="peer-profile"){emit({type:"peer-profile",profile:change.profile,peerId:p2p.peerId,origin:"p2p",timestamp:new Date().toISOString()});return}if(change.type==="put"){memory.put(change.node);if(enabled.indexedDB)await indexedDBStore.put(change.node)}else if(change.type==="delete"){memory.delete(change.node.id);if(enabled.indexedDB)await indexedDBStore.delete(change.node.id)}emit({...change,origin:"p2p",timestamp:new Date().toISOString()})}
export const storage={
 async start(){if(ready)return;await memory.start();if(enabled.indexedDB){await indexedDBStore.start();await migratePrototypeData();for(const node of await indexedDBStore.list())memory.put(node)}p2p.start({onRemoteChange:acceptRemote,onStatus:status=>emit({type:"peer-status",status,origin:"p2p",timestamp:new Date().toISOString()})});ready=true;emit({type:"ready",origin:"storage",timestamp:new Date().toISOString()})},
 subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener)},list(){return memory.list()},get(id){return memory.get(id)},has(id){return memory.has(id)},
 async put(node,{origin="local"}={}){memory.put(node);if(enabled.indexedDB)await indexedDBStore.put(node);const change=event("put",node,origin);if(enabled.p2p&&origin!=="p2p")p2p.send(change);emit(change);return node},
 async delete(id,{origin="local"}={}){const node=memory.get(id);memory.delete(id);if(enabled.indexedDB)await indexedDBStore.delete(id);const change=event("delete",node??{id},origin);if(enabled.p2p&&origin!=="p2p")p2p.send(change);emit(change);return true},
 async setEnabled(capability,value){if(!(capability in enabled))throw new Error(`Unknown capability: ${capability}`);if(capability==="indexedDB"&&value&&!enabled.indexedDB){await indexedDBStore.start();for(const node of memory.list())await indexedDBStore.put(node)}if(capability==="indexedDB"&&!value&&enabled.indexedDB)await indexedDBStore.stop();enabled[capability]=Boolean(value);emit({type:"capability",capability,enabled:enabled[capability],origin:"storage",timestamp:new Date().toISOString()})},
 capabilities(){return{...enabled,memory:true}},
 async createPeerOffer(){enabled.p2p=true;return p2p.createOffer()},
 async createPeerRendezvous(){enabled.p2p=true;return p2p.createRendezvous()},
 async answerPeerRendezvous(token){enabled.p2p=true;return p2p.answerRendezvous(token)},
 async waitForPeerRendezvousAnswer(token){enabled.p2p=true;return p2p.waitForRendezvousAnswer(token)},
 async acceptPeerOffer(code){enabled.p2p=true;return p2p.acceptOffer(code)},
 async acceptPeerAnswer(code){enabled.p2p=true;await p2p.acceptAnswer(code)},
 async sendAllToPeer(){for(const node of memory.list())p2p.send(event("put",node,"local"))},
 sendProfileToPeer(profile){p2p.sendProfile(profile)}
};
