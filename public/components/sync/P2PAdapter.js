export class P2PAdapter {
  constructor(){this.pc=null;this.channel=null;this.onRemoteChange=null;this.onStatus=null}
  async createOffer(){this.reset();this.pc=this.makePeer();this.channel=this.pc.createDataChannel("holarchy");this.bindChannel(this.channel);const offer=await this.pc.createOffer();await this.pc.setLocalDescription(offer);await this.waitIce();return btoa(JSON.stringify(this.pc.localDescription))}
  async acceptOffer(code){this.reset();this.pc=this.makePeer();await this.pc.setRemoteDescription(JSON.parse(atob(code.trim())));const answer=await this.pc.createAnswer();await this.pc.setLocalDescription(answer);await this.waitIce();return btoa(JSON.stringify(this.pc.localDescription))}
  async acceptAnswer(code){await this.pc.setRemoteDescription(JSON.parse(atob(code.trim())))}
  start({onRemoteChange,onStatus}={}){this.onRemoteChange=onRemoteChange;this.onStatus=onStatus}
  stop(){this.channel?.close();this.pc?.close();this.reset();this.onStatus?.("off")}
  send(change){if(this.channel?.readyState==="open")this.channel.send(JSON.stringify(change))}
  makePeer(){const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});pc.ondatachannel=e=>{this.channel=e.channel;this.bindChannel(this.channel)};pc.onconnectionstatechange=()=>this.onStatus?.(pc.connectionState);return pc}
  bindChannel(channel){channel.onopen=()=>this.onStatus?.("connected");channel.onclose=()=>this.onStatus?.("closed");channel.onmessage=e=>{try{this.onRemoteChange?.(JSON.parse(e.data))}catch{}}}
  waitIce(){if(this.pc.iceGatheringState==="complete")return Promise.resolve();return new Promise(resolve=>{const done=()=>{if(this.pc.iceGatheringState==="complete"){this.pc.removeEventListener("icegatheringstatechange",done);resolve()}};this.pc.addEventListener("icegatheringstatechange",done);setTimeout(resolve,4000)})}
  reset(){this.pc=null;this.channel=null}
}
