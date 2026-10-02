export class SignalRoom {
  constructor(state){this.state=state}
  async fetch(request){
    const headers={"content-type":"application/json","cache-control":"no-store"};
    if(request.method==="POST"){
      const body=await request.json();
      await this.state.storage.put("signal",{body,expiresAt:Date.now()+120000});
      return new Response('{"ok":true}',{headers});
    }
    if(request.method==="GET"){
      const record=await this.state.storage.get("signal");
      if(!record||record.expiresAt<=Date.now()){
        if(record) await this.state.storage.delete("signal");
        return new Response("null",{headers});
      }
      return new Response(JSON.stringify(record.body),{headers});
    }
    if(request.method==="DELETE"){
      await this.state.storage.delete("signal");
      return new Response('{"ok":true}',{headers});
    }
    return new Response("Method not allowed",{status:405});
  }
}
export default {
 async fetch(request,env){
   const url=new URL(request.url);
   if(url.pathname.startsWith("/signal/")){
     const token=url.pathname.slice(8);
     if(!/^[a-zA-Z0-9_-]{16,128}$/.test(token)) return new Response("Bad signal token",{status:400});
     const id=env.SIGNAL_ROOMS.idFromName(token);
     return env.SIGNAL_ROOMS.get(id).fetch(request);
   }
   return env.ASSETS.fetch(request);
 }
};
