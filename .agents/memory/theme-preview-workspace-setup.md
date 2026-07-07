---
name: Theme-preview workspace setup
description: How the pnpm workspace is structured for this project and what broke during initial setup.
---

## The problem
The `artifacts/theme-preview` package.json had `catalog:` dependency specifiers but no `pnpm-workspace.yaml` existed to define the catalog versions. Also, root `package.json` had `@shopify/cli-hydrogen` which transitively depends on `liquidjs`, a package blocked (403) by the Replit package firewall.

## The fix
1. Created `/pnpm-workspace.yaml` with `packages: ["artifacts/*", "lib/*"]` and a `catalog:` block pinning all shared deps (vite, react, tailwindcss, etc.).
2. Removed `@shopify/cli` and `@shopify/cli-hydrogen` from root `package.json` devDependencies — they are not needed in Replit; Shopify CLI cannot run in this sandbox.
3. Fixed the theme-preview `package.json` scripts: replaced workspace-level scripts (`pnpm -r --if-present run build`) with proper Vite scripts (`"dev": "vite"`, `"build": "vite build"`).
4. Removed unused `@workspace/api-client-react` workspace dep from theme-preview.
5. Fixed a syntax error in `ProductDetailPage.tsx` — duplicate `const imgVariants` declaration (lines 80 and 82) caused by a bad edit, removed the incomplete line 80.

**Why:** The original package.json was copy-pasted from the workspace root without adapting scripts, and the catalog was never defined.

**How to apply:** If any artifact fails with `ERR_PNPM_CATALOG_ENTRY_NOT_FOUND_FOR_SPEC`, add the missing entry to `pnpm-workspace.yaml` catalog. If `liquidjs` (or other Shopify packages) blocks install, check root `package.json` for `@shopify/cli*` deps.
