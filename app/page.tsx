import { ConfigNote } from "@/components/config-note";
import { ProductCard } from "@/components/product-card";
import { getEcwidConfig, listEcwidProducts } from "@/lib/ecwid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
	const config = getEcwidConfig();

	if (!config.hasApiToken) {
		return (
			<main className="page-shell">
				<section className="hero">
					<p className="eyebrow">sites/nextjs-example-full-ssr</p>
					<h1>Ecwid full SSR example</h1>
					<p className="lede">
						This app renders product content from Ecwid REST API on the server
						instead of mounting Ecwid widgets on the client.
					</p>
				</section>
				<ConfigNote storeId={config.storeId} />
			</main>
		);
	}

	const products = await listEcwidProducts();

	return (
		<main className="page-shell">
			<section className="hero">
				<p className="eyebrow">sites/nextjs-example-full-ssr</p>
				<h1>Ecwid full SSR example</h1>
				<p className="lede">
					All product content on this page is rendered from Ecwid REST API in
					the server response HTML.
				</p>
				<p className="muted">
					Auth mode: <code>{config.tokenMode}</code>
				</p>
			</section>

			<section className="product-grid">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</section>
		</main>
	);
}
