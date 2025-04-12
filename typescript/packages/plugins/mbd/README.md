# MBD Social Plugin for GOAT SDK

A powerful plugin for the GOAT SDK that enhances Farcaster social applications with AI-powered content recommendations, personalized feeds, trend analysis, and user interest mapping.

## Installation

```bash
# Install the plugin
npm install @goat-sdk/plugin-mbd

# Or with yarn
yarn add @goat-sdk/plugin-mbd
```

## Setup

```typescript
import { mbdSocial } from '@goat-sdk/plugin-mbd';
import { Goat } from '@goat-sdk/core';

// Initialize the plugin
const mbdPlugin = mbdSocial({
  mbdApiKey: "YOUR_MBD_API_KEY",
  neynarApiKey: "YOUR_NEYNAR_API_KEY"
});

// Add plugin to GOAT instance
const goat = new Goat({
  plugins: [mbdPlugin]
});
```

## Features

This plugin leverages the MBD API in combination with Neynar to provide enhanced Farcaster social features:

### Personalized Feed
Generate user-specific content feeds based on interests and engagement patterns.

```typescript
const feed = await goat.tools.get_personalized_feed({
  fid: 1234,         // Farcaster user ID
  scoring: "recency", // Scoring method (recency, relevance, engagement)
  limit: 25          // Number of results
});
```

### Content Discovery
Find similar casts or trending content within specific time windows.

```typescript
// Get similar casts
const similarCasts = await goat.tools.get_similar_casts({
  castId: "0x1234...", // Hash of the target cast
  limit: 10
});

// Get trending content
const trending = await goat.tools.get_trending_feed({
  scoring: "24h",     // Time window (24h, 7d, 30d)
  limit: 20
});
```

### User Interest Analysis
Analyze a user's content and engagement to determine their interests.

```typescript
const interests = await goat.tools.get_user_interests({
  fid: 1234
});
```

### Content Recommendations
Generate personalized content recommendations based on user interests.

```typescript
const recommendations = await goat.tools.get_content_recommendations({
  fid: 1234,
  contentType: "casts" // Type of content to recommend
});
```

### Similar Users
Find users with similar interests and engagement patterns.

```typescript
const similarUsers = await goat.tools.get_similar_users({
  fid: 1234,
  limit: 15
});
```

### Trend Analysis
Analyze trends in a user's network and interest areas.

```typescript
const trends = await goat.tools.get_trend_analysis({
  fid: 1234,
  timeframe: "7d"     // Analysis window (24h, 7d, 30d)
});
```

## Response Examples

### User Interests Analysis

```json
{
  "status": "success",
  "message": "Analyzed interests for user 1234",
  "interests": [
    { "topic": "web3", "score": 8.2 },
    { "topic": "AI", "score": 7.5 },
    { "topic": "developer tools", "score": 6.9 },
    { "topic": "crypto", "score": 5.4 },
    { "topic": "startups", "score": 4.2 }
  ],
  "topInterests": ["web3", "AI", "developer tools", "crypto", "startups"]
}
```

### Trend Analysis

```json
{
  "status": "success",
  "message": "Analyzed trends for user 1234 over 7d",
  "topInterests": ["web3", "AI", "developer tools"],
  "interestTrends": {
    "web3": [/* array of relevant casts */],
    "AI": [/* array of relevant casts */],
    "developer tools": [/* array of relevant casts */]
  },
  "sentimentAnalysis": {
    "positive": 42,
    "negative": 12,
    "neutral": 26,
    "total": 80
  },
  "timeframe": "7d"
}
```

## Error Handling

All tools return standardized responses with `status` and `message` fields:

```typescript
// Success response
{
  status: "success",
  message: "Retrieved 25 personalized casts for user 1234",
  // Additional data...
}

// Error response
{
  status: "error", 
  message: "Failed to get personalized feed: API rate limit exceeded"
}
```

## Requirements

- Node.js 16+
- Valid MBD API key
- Valid Neynar API key

## License

MIT

## Links

- [GitHub Repository](https://github.com/goat-sdk/goat)
- [Documentation](https://ohmygoat.dev)
- [Issues](https://github.com/goat-sdk/goat/issues)