import { defineConfig } from "vite";

import copy from "rollup-plugin-copy";

export default defineConfig({
  base: "./",
  build: {
    target: "esnext",
    minify: "esbuild",
  },
  plugins: [
    copy({
      targets: [
        { src: "./icon.png", dest: "./dist/" },
        { src: "./package.json", dest: "./dist/" },
        { src: "./LICENSE", dest: "./dist/" },
      ],
      hook: 'writeBundle'
    }),
  ],
});
