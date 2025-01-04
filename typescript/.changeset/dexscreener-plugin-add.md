---
"@goat-sdk/plugin-dexscreener": patch
---

feat: add dexscreener plugin with rate-limited API tools for DEX pair data

- Implements getPairsByChainAndPair for fetching specific pairs
- Adds searchPairs for query-based pair discovery
- Provides getTokenPairs for bulk token pair information
- Includes built-in rate limiting (300 req/min for pairs endpoint)
