/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoyativeBuyButton } from "@/components/loyative-buy-button";
import { getEcwidProduct, getEcwidProductImage } from "@/lib/ecwid";

export const dynamic = "force-dynamic";

type ProductPageProps = {
	params: {
		productId: string;
	};
};

export default async function ProductPage({ params }: ProductPageProps) {
	const product = await getEcwidProduct(params.productId);

	if (!product) {
		notFound();
	}

	const imageUrl = getEcwidProductImage(product);
	const storeId = process.env.ECWID_STORE_ID ?? "87218280";
	const widgetUrl =
		process.env.LOYATIVE_WIDGET_URL ?? "https://store.loyative.com/widget";

	return (
		<main className="page-shell">
			<div className="page-header">
				<Link href="/">Back</Link>
				<h1>{product.name}</h1>
				<p>{product.defaultDisplayedPriceFormatted ?? "Price unavailable"}</p>
			</div>

			<section className="product-detail">
				{imageUrl ? (
					<img
						alt={product.name}
						className="product-detail-image"
						src={imageUrl}
					/>
				) : (
					<div className="product-detail-image product-image-fallback">
						No image
					</div>
				)}

				<div className="product-detail-copy">
					<p className={product.inStock ? "stock stock-in" : "stock stock-out"}>
						{product.inStock ? "In stock" : "Out of stock"}
					</p>
					<p className="product-meta">
						{product.sku ? `SKU ${product.sku}` : "Ecwid product"}
					</p>
					<section className="buy-panel">
						<p className="buy-panel-label">
							Client-side buy button via Loyative widget
						</p>
						<LoyativeBuyButton
							productId={product.id}
							storeId={storeId}
							widgetUrl={widgetUrl}
						/>
					</section>
					{product.description ? (
						<div
							className="rich-text"
							dangerouslySetInnerHTML={{ __html: product.description }}
						/>
					) : (
						<p className="muted">No description returned by Ecwid.</p>
					)}
				</div>
			</section>
		</main>
	);
}
