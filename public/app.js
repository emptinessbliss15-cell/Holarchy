import {addNode,listNodes,removeNode,setStorageCapability,startHolarchy,storageCapabilities,subscribe} from "./holarchy.js";

const form=document.querySelector("#node-form");
const nameInput=document.querySelector("#node-name");
const typeInput=document.querySelector("#node-type");
const list=document.querySelector("#node-list");
const empty=document.querySelector("#empty-state");
const count=document.querySelector("#node-count");
const toggles=[...document.querySelectorAll("[data-capability]")];

function render(){
  const nodes=listNodes();
  list.replaceChildren();
  count.textContent=`${nodes.length} local`;
  empty.hidden=nodes.length>0;
  for(const node of nodes.slice().reverse()){
    const item=document.createElement("li"),info=document.createElement("div"),title=document.createElement("strong"),meta=document.createElement("small"),remove=document.createElement("button");
    title.textContent=node.name; meta.textContent=`${node.type} · ${node.id.slice(0,8)}`; info.append(title,meta);
    remove.type="button"; remove.className="secondary"; remove.textContent="×"; remove.title="Remove local node";
    remove.addEventListener("click",()=>removeNode(node.id));
    item.append(info,remove); list.append(item);
  }
  const caps=storageCapabilities();
  for(const toggle of toggles) toggle.checked=Boolean(caps[toggle.dataset.capability]);
}

form.addEventListener("submit",async event=>{
  event.preventDefault(); const name=nameInput.value.trim(); if(!name)return;
  await addNode({name,type:typeInput.value}); form.reset(); nameInput.focus();
});
for(const toggle of toggles) toggle.addEventListener("change",async()=>setStorageCapability(toggle.dataset.capability,toggle.checked));
subscribe(render);
await startHolarchy();
render();
