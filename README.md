# `widget-nextjs-ssr-example`

Example integration of Loyative Widget Script with Next.js and the Loyative
storefront API.

This example shows how to:

- render storefront categories and products on the server with Next.js
- authenticate against the Loyative API with publisher credentials on the server
- cache access and refresh tokens in server memory
- enhance the product detail page on the client with Loyative Widget Script

## What It Demonstrates

- SSR homepage built by fetching top-level categories first, then category
  products from `/storefront/category/{id}/products`
- SSR product detail page resolved from a category-scoped product list
- server-only authentication against `/auth/sign-in` and `/auth/refresh`
- client-only Loyative widget loading on the product detail page
- configurable Loyative widget base URL via env for local or alternate environments

## Local Development

1. Copy `.env.example` to `.env.local`.
2. Set:

   ```bash
   PUBLISHER_API_BASE_URL=https://api.reachorders.com
   PUBLISHER_USERNAME=publisher@example.com
   PUBLISHER_PASSWORD=publisher-password
   ECWID_STORE_ID=87218280
   LOYATIVE_WIDGET_URL=https://store.loyative.com/widget
   ```

   Notes:

   - `PUBLISHER_USERNAME` is sent as the `email` field to `/auth/sign-in`
     because that is what the Loyative API expects.
   - If you accidentally use `https://api.reachorders.com/api`, the app now
     normalizes that automatically to the working API origin.
   - Access and refresh tokens are kept in process memory on the server side.
- Publisher credentials must stay server-only and must not be exposed
  through `NEXT_PUBLIC_*`.
- `ECWID_STORE_ID` is still required for the Loyative widget script bootstrap.

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

- `/`: SSR category sections with products fetched from `/storefront/*`
- `/categories/[categoryId]/[categorySlug]/products/[productId]`: SSR product
  detail page resolved by category context

## Rendering Model

- Loyative storefront data is fetched on the server and rendered into the HTML
  response.
- Loyative widget script is loaded only on the client.
- The product page renders buy-button placeholder markup in HTML, then calls
  `xProduct()` after the Loyative script loads.
- The Loyative widget script URL is built from:

  ```text
  ${LOYATIVE_WIDGET_URL}.js?${ECWID_STORE_ID}
  ```

Because the Loyative API does not expose a single-product storefront endpoint, the
product detail route includes both category information and product ID so the
server can fetch the category product list and resolve the correct product from
that result.

## Notes

- The API host currently uses the `reachorders.com` domain, but in this example
  it is treated as the Loyative API in all user-facing copy.
- The app trims accidental surrounding quotes and trailing whitespace from the
  relevant env vars to be more tolerant of Vercel secret formatting mistakes.

## GitHub Actions

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml`.

It runs these checks on pull requests and pushes to `main`:

- Next.js ESLint
- TypeScript typecheck
- Next.js production build

On pushes to `main`, the same workflow deploys to Vercel after the checks pass.

Required GitHub secret for deployment:

- `VERCEL_TOKEN`
