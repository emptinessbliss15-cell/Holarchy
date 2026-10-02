import Hyperswarm from "hyperswarm";
import crypto from "hypercore-crypto";
import b4a from "b4a";

export class HyperswarmAdapter {
  constructor({topicName="holarchy-public"}={}){this.topicName=topicName;this.swarm=null;this.connections=new Set();this.onRemoteChange=null;this.onStatus=null}
  topic(){return crypto.data(Buffer.from(this.topicName))}
  async start({onRemoteChange,onStatus}={}){
    this.onRemoteChange=onRemoteChange;this.onStatus=onStatus;
    this.swarm=new Hyperswarm();
    this.swarm.on("connection",(conn,info)=>{this.connections.add(conn);const peer=b4a.toString(info.publicKey,"hex");this.onStatus?.({state:"connected",peer});let pending="";conn.on("data",data=>{pending+=b4a.toString(data);let i;while((i=pending.indexOf("\n"))>=0){const line=pending.slice(0,i);pending=pending.slice(i+1);if(!line)continue;try{this.onRemoteChange?.(JSON.parse(line))}catch{}}});conn.once("close",()=>{this.connections.delete(conn);this.onStatus?.({state:"disconnected",peer})})});
    const discovery=this.swarm.join(this.topic(),{client:true,server:true});await discovery.flushed();this.onStatus?.({state:"discovering",topic:this.topicName});return this
  }
  broadcast(change){const data=JSON.stringify(change)+"\n";for(const conn of this.connections)conn.write(data)}
  async stop(){if(this.swarm)await this.swarm.destroy();this.swarm=null;this.connections.clear()}
}
