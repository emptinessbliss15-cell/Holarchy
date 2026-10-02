const STORAGE_KEY = "holarchy.nodes.v1";
export function loadNodes(){try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");return Array.isArray(value)?value:[]}catch{return []}}
export function saveNodes(nodes){localStorage.setItem(STORAGE_KEY,JSON.stringify(nodes))}
export function createNode({name,type="node"}){const now=new Date().toISOString();return{id:crypto.randomUUID(),name:name.trim(),type,createdAt:now,updatedAt:now}}
export function addNode(input){const nodes=loadNodes();const node=createNode(input);nodes.push(node);saveNodes(nodes);return node}
export function removeNode(id){saveNodes(loadNodes().filter(node=>node.id!==id))}
