export class SupabaseAdapter {
  constructor({url,key,table="holarchy_nodes"}){this.url=url;this.key=key;this.table=table;this.client=null;this.channel=null}
  async start({onRemoteChange}={}){
    const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2");
    this.client=createClient(this.url,this.key);
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
