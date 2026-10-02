# Holarchy

Local-first, peer-to-peer infrastructure for emergent holarchic organization.

> The organization doesn't need to exist before the people organize.

## Core principle

**Create locally. Route opportunistically. Deliver eventually.**

Creating something in Holarchy must not depend on a server or a live network connection. A node is created and stored on the local device first. Available transports can then move it toward the people, communities, or infrastructure authorized to receive it.

Loss of connectivity should normally mean **delay, not failure**.

Holarchy distinguishes three related operations:

- **Replication** — another authorized device receives a copy of a node.
- **Routing** — a device temporarily carries data toward an intended recipient without thereby becoming an authorized reader or owner.
- **Synchronization** — stores reconcile permitted state when they encounter one another.

A device may therefore contain local data, replicated shared data, and encrypted **in-transit** data it is carrying for someone else.

### Store-and-forward

Holarchy should support delay-tolerant, store-and-forward delivery. A device with no Wi-Fi or cellular connection can create a message locally and later hand an encrypted package to another nearby device. That device may carry it until it encounters the recipient, a useful peer, local Wi-Fi, or internet-connected synchronization infrastructure.

A courier's possession of encrypted bytes does **not** grant permission to read the contents.

Routing can begin simply: when two devices meet, each can ask whether it carries something addressed to a person or community the other can help reach. More sophisticated route knowledge can evolve later without changing the node model.

Delivery acknowledgements may return by a different route from the original message.

## Milestone 1 — local nodes

The first prototype established the local-first boundary:

- Create a node in a browser.
- Store it locally on that device.
- Reload or close/reopen the page.
- The node remains.

The prototype now also demonstrates direct browser-to-browser peer exchange using WebRTC (Web Real-Time Communication).

## Direction

1. Local nodes and persistence
2. Person identity and device relationships
3. Peer-to-peer node exchange
4. Audience/privacy boundaries and encryption
5. Persistent delivery, acknowledgements, and synchronization
6. Store-and-forward routing across available transports
7. Conflict-safe/CRDT replication
8. Emergent circles, agreements, and governance
9. Optional shared infrastructure for durable delivery and synchronization

Possible transports include direct peer-to-peer connections, local Wi-Fi, Bluetooth-capable native clients, and internet synchronization. No single transport should define Holarchy.

The local device remains the source of truth for locally created state. Remote infrastructure is a synchronization, discovery, and durable-delivery capability—not the owner of the network.
