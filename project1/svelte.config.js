import adapter from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';

const config = {
  kit: {
    adapter: adapter({
      // Optional: Specify the fallback file (SPA behavior)
      fallback: 'index.html'
    }),
    // Remove the target option
    // target: '#svelte'
    // Optionally, specify paths for assets, routes, etc., if you have a non-default structure
    // paths: { base: '', assets: '' },
    // Optionally, add other kit options if needed
    // appDir: 'app_',
  },
  // Add preprocess configuration here
  preprocess: sveltePreprocess({
    typescript: true, // Enables TypeScript preprocessing
    // You can add more preprocess options here (like SCSS, PostCSS, etc.)
  })
};

export default config;