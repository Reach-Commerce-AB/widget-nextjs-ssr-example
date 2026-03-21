# `nextjs-example-full-ssr`

Example integration of Loyative Widget Script with Next.js and Ecwid API.

This example shows how to:

- render Ecwid catalog/product data on the server with Next.js
- keep Ecwid API tokens on the server side
- enhance the product detail page on the client with Loyative Widget Script

The result is a hybrid setup:

- product list and product detail content come from Ecwid REST API and are
  rendered in SSR HTML
- the buy button is initialized on the client through Loyative widget script

## What It Demonstrates

- SSR product listing page from Ecwid REST API
- SSR product detail page from Ecwid REST API
- server-only token usage via `ECWID_PUBLIC_TOKEN` or `ECWID_SECRET_TOKEN`
- client-only Loyative widget loading on the product detail page
- configurable Loyative widget base URL via env for local or alternate environments

## Local Development

1. Copy `.env.example` to `.env.local`.
2. Set:

   ```bash
   ECWID_STORE_ID=87218280
   ECWID_SECRET_TOKEN=your_secret_token_here
   LOYATIVE_WIDGET_URL=https://store.loyative.com/widget
   ```

   Notes:

   - `ECWID_PUBLIC_TOKEN` can be used instead of `ECWID_SECRET_TOKEN` if it has enough access.
   - If Ecwid returns `403`, use `ECWID_SECRET_TOKEN`.
   - `ECWID_SECRET_TOKEN` must stay server-only and must not be exposed through `NEXT_PUBLIC_*`.

3. Install dependencies:

   ```bash
   yarn install
   ```

4. Start the dev server:

   ```bash
   yarn dev
   ```

Open `http://localhost:3000`.

## Routes

- `/`: SSR product list from Ecwid REST API
- `/products/[productId]`: SSR product detail page

## Rendering Model

- Ecwid data is fetched on the server and rendered into the HTML response.
- Loyative widget script is loaded only on the client.
- The product page renders buy-button placeholder markup in HTML, then calls
  `xProduct()` after the Loyative script loads.
- The Loyative widget script URL is built from:

  ```text
  ${LOYATIVE_WIDGET_URL}.js?${ECWID_STORE_ID}
  ```

## GitHub Actions

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml`.

It runs these checks on pull requests and pushes to `main`:

- Biome formatting check
- Biome lint check
- Next.js ESLint
- TypeScript typecheck
- Next.js production build

On pushes to `main`, the same workflow deploys to Vercel after the checks pass.

Required GitHub secret for deployment:

- `VERCEL_TOKEN`
