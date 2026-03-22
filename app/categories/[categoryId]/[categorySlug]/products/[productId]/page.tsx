/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoyativeBuyButton } from "@/components/loyative-buy-button";
import {
	getCategoryProduct,
	getDisplayCategoryName,
	getStorefrontProductAvailability,
	getStorefrontProductImage,
	getStorefrontProductPrice,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

type ProductPageProps = {
	params: {
		categoryId: string;
		categorySlug: string;
		productId: string;
	};
};

export default async function ProductPage({ params }: ProductPageProps) {
	const product = await getCategoryProduct({
		categoryId: params.categoryId,
		productId: params.productId,
	});

	if (!product) {
		notFound();
	}

	const categoryName = getDisplayCategoryName(params.categorySlug);
	const ecwidStoreId = process.env.ECWID_STORE_ID;
	const availability = getStorefrontProductAvailability(product);
	const imageUrl = getStorefrontProductImage(product);
	const widgetUrl =
		process.env.LOYATIVE_WIDGET_URL ?? "https://store.loyative.com/widget";

	return (
		<main className="page-shell">
			<div className="page-header">
				<Link href="/">Back</Link>
				<p className="eyebrow">Category: {categoryName}</p>
				<h1>{product.name}</h1>
				<p>{getStorefrontProductPrice(product)}</p>
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
					<p className={`stock stock-${availability.tone}`}>
						{availability.label}
					</p>
					<p className="product-meta">
						{product.brand ? `Brand ${product.brand}` : "Storefront product"}
					</p>
					<section className="buy-panel">
						<p className="buy-panel-label">
							Client-side buy button via Loyative widget
						</p>
						{ecwidStoreId ? (
							<LoyativeBuyButton
								ecwidStoreId={ecwidStoreId}
								productId={product.storeProductId}
								widgetUrl={widgetUrl}
							/>
						) : (
							<p className="muted">
								Set <code>ECWID_STORE_ID</code> to enable the Loyative buy
								button.
							</p>
						)}
					</section>
					{product.description ? (
						<div
							className="rich-text"
							dangerouslySetInnerHTML={{ __html: product.description }}
						/>
					) : (
						<p className="muted">No description returned by Reach Orders.</p>
					)}
				</div>
			</section>
		</main>
	);
}
