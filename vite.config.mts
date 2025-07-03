import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    assetsDir: "code",
    target: ["esnext", "edge100", "firefox100", "chrome100", "safari18"],
  },
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      injectManifest: {
        maximumFileSizeToCacheInBytes: 3000000,
        swSrc: "public/sw.js",
        swDest: "dist/sw.js",
        globDirectory: "dist",
        globPatterns: ["**/*.{html,js,css,json, png,svg,ttf,otf,woff,woff2,eot}"],
      },
      workbox: {
        globPatterns: ["**/*.{html,js,css,json,png,ttf,otf,woff,woff2,eot}"],
      },
      injectRegister: false,
      manifest: false,
      devOptions: {
        enabled: true,
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: "d2beam_wasm.*",
          dest: ".",
        },
        {
          src: "src/info/Kurzdokumentation_deutsch.html",
          dest: "./src/info/",
        },
      ],
    }),
  ],
});
