import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

const { MODULE_NAME } = process.env;

if(typeof MODULE_NAME !== 'string') {
    throw new Error('MODULE_NAME is not set');
}

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
      include: ["**/*.svelte"],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        [MODULE_NAME as string]: `src/components/Executables/${MODULE_NAME}.svelte`,
      },
      output: {
        dir: `fs/_EXEC/${MODULE_NAME}`,
        entryFileNames: () => {
          return '[name].js';
        },
      },
    },
  },
});