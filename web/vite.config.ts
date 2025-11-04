import { defineConfig } from 'vite';
import * as path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@wasm': path.resolve(__dirname, './public/wasm/pkg'),
        },
    },
    optimizeDeps: {
        exclude: ['@wasm'],
    },
    build: {
        target: 'esnext',
    },
    base: './',
    server: {
        port: 3000
    }
});
