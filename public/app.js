import { addNode, listNodes, removeNode } from "./holarchy.js";

const form = document.querySelector("#node-form");
const nameInput = document.querySelector("#node-name");
const typeInput = document.querySelector("#node-type");
const list = document.querySelector("#node-list");
const empty = document.querySelector("#empty-state");
const count = document.querySelector("#node-count");

function render() {
  const nodes = listNodes();
  list.replaceChildren();
  count.textContent = `${nodes.length} local`;
  empty.hidden = nodes.length > 0;

  for (const node of nodes.slice().reverse()) {
    const item = document.createElement("li");
    const info = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("small");
    const remove = document.createElement("button");

    title.textContent = node.name;
    meta.textContent = `${node.type} · ${node.id.slice(0, 8)}`;
    info.append(title, meta);

    remove.type = "button";
    remove.className = "secondary";
    remove.textContent = "×";
    remove.title = "Remove local node";
    remove.addEventListener("click", () => {
      removeNode(node.id);
      render();
    });

    item.append(info, remove);
    list.append(item);
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  addNode({ name, type: typeInput.value });
  form.reset();
  nameInput.focus();
  render();
});

render();
