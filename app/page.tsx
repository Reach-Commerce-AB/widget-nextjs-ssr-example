import { ConfigNote } from "@/components/config-note";
import { ProductCard } from "@/components/product-card";
import {
	getStorefrontConfig,
	listProductsForCategory,
	listTopLevelCategories,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

export default async function HomePage() {
	const config = getStorefrontConfig();

	if (!config.hasCredentials) {
		return (
			<main className="page-shell">
				<section className="hero">
					<p className="eyebrow">Loyative API + Loyative Widget</p>
					<h1>Loyative storefront SSR example</h1>
					<p className="lede">
						This app renders storefront data from the Loyative API on the
						server, then enhances the product page with the Loyative widget on
						the client.
					</p>
				</section>
				<ConfigNote apiBaseUrl={config.apiBaseUrl} />
			</main>
		);
	}

	const categories = await listTopLevelCategories();
	const categorySections = (
		await Promise.all(
			categories.map(async (category) => ({
				category,
				products: await listProductsForCategory(String(category.id)),
			})),
		)
	).filter((entry) => entry.products.length > 0);

	return (
		<main className="page-shell">
			<section className="hero">
				<p className="eyebrow">Loyative API + Loyative Widget</p>
				<h1>Loyative storefront SSR example</h1>
				<p className="lede">
					Top-level categories are fetched first, then products are fetched from
					each visible category on the server.
				</p>
				<p className="muted">
					Data source: <code>/storefront/*</code>
				</p>
			</section>

			{categorySections.map(({ category, products }) => (
				<section className="category-section" key={category.id}>
					<div className="category-section-header">
						<p className="eyebrow">Category</p>
						<h2>{category.name}</h2>
					</div>
					<div className="product-grid">
						{products.map((product) => (
							<ProductCard
								category={category}
								key={`${category.id}-${product.id}`}
								product={product}
							/>
						))}
					</div>
				</section>
			))}
		</main>
	);
}
