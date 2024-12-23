# Hyperliquid Plugin Implementation Rules

Based on analysis of the Uniswap plugin, here are the key patterns and requirements for implementing a GOAT plugin:

## Directory Structure
```
hyperliquid/
├── src/
│   ├── index.ts           # Main entry point
│   ├── parameters.ts      # Plugin parameters definition
│   ├── types/            # TypeScript type definitions
│   ├── hyperliquid.plugin.ts  # Plugin class definition
│   └── hyperliquid.service.ts # Service implementation
├── package.json          # Package configuration
├── tsconfig.json        # TypeScript configuration
├── tsup.config.ts      # Build configuration
└── turbo.json          # Turborepo configuration
```

## Key Implementation Requirements

1. Plugin Class Structure:
   - Must extend `PluginBase` from "@goat-sdk/core"
   - Constructor takes configuration parameters
   - Must implement `supportsChain` method to specify supported blockchain networks

2. Type Safety:
   - Use TypeScript for all implementations
   - Define clear interface for constructor parameters
   - Follow strict type checking

3. Code Organization:
   - Separate business logic into service class
   - Keep plugin class focused on configuration and chain support
   - Use types directory for shared interfaces

4. Configuration:
   - Define supported chains explicitly
   - Use constructor params for configuration
   - Follow TypeScript best practices for parameter typing

5. Code Style:
   - Follow project's ESLint rules
   - Use consistent naming conventions
   - Maintain clear documentation

## Implementation Notes

1. The plugin class should be minimal, primarily handling:
   - Chain support verification
   - Basic configuration
   - Service initialization

2. Service class should contain:
   - Core business logic
   - API interactions
   - Data transformation

3. Types should be:
   - Well-documented
   - Exported for external use
   - Properly namespaced

4. Parameters should:
   - Have clear validation
   - Use TypeScript for type safety
   - Include default values where appropriate
