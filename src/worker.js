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
   if(url.pathname==="/supabase-config"){
     if(!env.SUPABASE_URL||!env.SUPABASE_PUBLISHABLE_KEY) return Response.json({error:"Supabase sync is not configured."},{status:503,headers:{"cache-control":"no-store"}});
     return Response.json({url:env.SUPABASE_URL,key:env.SUPABASE_PUBLISHABLE_KEY},{headers:{"cache-control":"no-store"}});
   }
   if(url.pathname==="/ice"){
     if(!env.TURN_KEY_ID||!env.TURN_KEY_API_TOKEN) return Response.json({iceServers:[{urls:"stun:stun.cloudflare.com:3478"}],turn:false},{headers:{"cache-control":"no-store"}});
     const response=await fetch("https://rtc.live.cloudflare.com/v1/turn/keys/"+env.TURN_KEY_ID+"/credentials/generate-ice-servers",{method:"POST",headers:{"authorization":"Bearer "+env.TURN_KEY_API_TOKEN,"content-type":"application/json"},body:JSON.stringify({ttl:600})});
     if(!response.ok) return Response.json({error:"TURN credential generation failed",status:response.status},{status:502,headers:{"cache-control":"no-store"}});
     const data=await response.json();
     return Response.json({...data,turn:true},{headers:{"cache-control":"no-store"}});
   }
   if(url.pathname.startsWith("/signal/")){
     const token=url.pathname.slice(8);
     if(!/^[a-zA-Z0-9_-]{16,128}$/.test(token)) return new Response("Bad signal token",{status:400});
     const id=env.SIGNAL_ROOMS.idFromName(token);
     return env.SIGNAL_ROOMS.get(id).fetch(request);
   }
   return env.ASSETS.fetch(request);
 }
};
