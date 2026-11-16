---
"@goat-sdk/plugin-qhooks": patch
---

Added the QHooks plugin with 25 market, proof, portfolio, perps, OTC and agreement read/prepare tools. Returned plans require the user wallet to review and sign.

Validate unsigned spot-trade plans against the original local request before wallet review: chain ids, pinned targets, exact approvals, decoded swap bounds/referrer/deadline/native value, and canonical SHA-256 integrity. The unsigned hash does not authenticate the server or price.
