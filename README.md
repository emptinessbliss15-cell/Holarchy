# Holarchy

Local-first, peer-to-peer infrastructure for emergent holarchic organization.

> The organization doesn't need to exist before the people organize.

## Milestone 1 — local nodes

The first prototype deliberately has no backend and no build step.

- Create a node in a browser.
- Store it locally on that device.
- Reload or close/reopen the page.
- The node remains.

This establishes the local-first boundary before adding peer discovery, CRDT replication, identity/public keys, or eventual server sync.

## Run

Serve the repository with any static HTTP server:

```bash
npx serve public
```

## Direction

1. Local nodes and persistence
2. Device identity
3. Peer-to-peer node exchange
4. Conflict-safe/CRDT replication
5. Emergent circles and governance
6. Optional eventual sync to shared infrastructure

The browser UI should remain useful offline. Remote infrastructure is an optional synchronization target, not the source of truth.
