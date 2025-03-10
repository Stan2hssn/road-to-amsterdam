import glsl from "vite-plugin-glsl";

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    glsl({
      include: [
        "**/*.glsl",
        "**/*.wgsl",
        "**/*.vert",
        "**/*.frag",
        "**/*.vs",
        "**/*.fs",
      ],
      exclude: undefined,
      warnDuplicatedImports: true,
      defaultExtension: "glsl",
      compress: false,
      watch: true,
      root: "/",
    }),
  ],
});
