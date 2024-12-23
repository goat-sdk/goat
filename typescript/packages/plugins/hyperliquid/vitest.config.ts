import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        environment: 'node',
        globals: true,
        setupFiles: ['dotenv/config']
    },
    resolve: {
        alias: {
            '@goat-sdk/core': path.resolve(__dirname, '../../core/src')
        }
    }
});
