export class SupabaseAdapter {
  constructor({url,key,configUrl="/supabase-config",table="holarchy_nodes"}={}){this.url=url;this.key=key;this.configUrl=configUrl;this.table=table;this.client=null;this.channel=null}
  async ensureClient(){if(this.client)return this.client;if(!this.url||!this.key){const response=await fetch(this.configUrl,{cache:"no-store"});if(!response.ok)throw new Error("Supabase sync is not configured.");const config=await response.json();this.url=config.url;this.key=config.key}const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2");this.client=createClient(this.url,this.key);return this.client}
  async signIn(email,password){const client=await this.ensureClient();const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;return data.user}
  async signOut(){if(this.client){const {error}=await this.client.auth.signOut();if(error)throw error}await this.stop()}
  async user(){const client=await this.ensureClient();const {data:{user}}=await client.auth.getUser();return user}
  async start({onRemoteChange}={}){
    await this.ensureClient();
    const {data:{session}}=await this.client.auth.getSession();
    if(!session)throw new Error("Supabase sync requires authentication.");
    const {data,error}=await this.client.from(this.table).select("*").is("deleted_at",null);if(error)throw error;
    for(const row of data??[])onRemoteChange?.({type:"put",node:row.body,origin:"supabase",changeId:row.change_id});
    this.channel=this.client.channel("holarchy-nodes").on("postgres_changes",{event:"*",schema:"public",table:this.table},payload=>{const row=payload.new?.id?payload.new:payload.old;if(!row)return;const deleted=payload.eventType==="DELETE"||row.deleted_at;onRemoteChange?.({type:deleted?"delete":"put",node:deleted?{id:row.id}:row.body,origin:"supabase",changeId:row.change_id})}).subscribe();
  }
  async stop(){if(this.client&&this.channel)await this.client.removeChannel(this.channel);this.channel=null}
  async put(node){const {data:{user}}=await this.client.auth.getUser();const {error}=await this.client.from(this.table).upsert({id:node.id,body:node,updated_at:new Date().toISOString(),deleted_at:null,author_id:user?.id??null,change_id:crypto.randomUUID()},{onConflict:"id"});if(error)throw error}
  async delete(id){const {error}=await this.client.from(this.table).update({deleted_at:new Date().toISOString(),updated_at:new Date().toISOString(),change_id:crypto.randomUUID()}).eq("id",id);if(error)throw error}
}
