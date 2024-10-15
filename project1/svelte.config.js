//import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            // You can add Node adapter options here
            out: 'build'  // This sets the output directory for the build
        })
    },
    preprocess: vitePreprocess()
};

export default config;

