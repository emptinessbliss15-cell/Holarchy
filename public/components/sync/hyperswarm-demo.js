import { HyperswarmAdapter } from "./HyperswarmAdapter.js";

const adapter=new HyperswarmAdapter({topicName:process.argv[2]||"holarchy-public"});
await adapter.start({
  onStatus: status=>console.log("[peer]",status),
  onRemoteChange: change=>console.log("[change]",change)
});
console.log("Holarchy Hyperswarm transport running. Type text to broadcast a test node.");
process.stdin.setEncoding("utf8");
process.stdin.on("data",text=>adapter.broadcast({changeId:crypto.randomUUID(),type:"put",origin:"hyperswarm",timestamp:new Date().toISOString(),node:{id:crypto.randomUUID(),type:"message",name:text.trim()}}));
