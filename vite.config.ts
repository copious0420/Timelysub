// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const config = defineConfig({
  vite: {
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      // TanStack Start's client and SSR bundles include large route and xlsx chunks.
      chunkSizeWarningLimit: 1000,
    },
    // These are public browser credentials. Keep them available when an
    // external host (such as Vercel) builds without Lovable's injected env.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        process.env['VITE_SUPABASE_URL'] || "https://sjtrwykdipzcdfcpjkjg.supabase.co",
      ),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        process.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ||
          "sb_publishable_pJCrQ-t58mT2b66C7OtvMw_5v_tJx3j",
      ),
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});

export default async (env: Parameters<typeof config>[0]) => {
  const resolvedConfig = await config(env);

  if (resolvedConfig.plugins) {
    resolvedConfig.plugins = resolvedConfig.plugins.filter(
      (plugin) =>
        Array.isArray(plugin) ||
        !plugin ||
        typeof plugin !== "object" ||
        !("name" in plugin) ||
        plugin.name !== "vite-tsconfig-paths",
    );
  }

  return resolvedConfig;
};
