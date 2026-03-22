/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
	getCategorySlug,
	getStorefrontProductAvailability,
	getStorefrontProductImage,
	getStorefrontProductPrice,
	type StorefrontProduct,
	type VisibleCategory,
} from "@/lib/storefront";

type ProductCardProps = {
	category: VisibleCategory;
	product: StorefrontProduct;
};

export function ProductCard({ category, product }: ProductCardProps) {
	const categorySlug = getCategorySlug(category);
	const availability = getStorefrontProductAvailability(product);
	const imageUrl = getStorefrontProductImage(product);
	const href = `/categories/${category.id}/${categorySlug}/products/${product.storeProductId}`;

	return (
		<article className="product-card">
			<Link className="product-card-link" href={href}>
				{imageUrl ? (
					<img alt={product.name} className="product-image" src={imageUrl} />
				) : (
					<div className="product-image product-image-fallback">No image</div>
				)}
				<div className="product-copy">
					<p className="product-meta">
						{product.brand ? `Brand ${product.brand}` : "Storefront product"}
					</p>
					<h2>{product.name}</h2>
					<p className="product-price">{getStorefrontProductPrice(product)}</p>
					{availability.tone === "out" ? (
						<p className={`stock stock-${availability.tone}`}>
							{availability.label}
						</p>
					) : null}
				</div>
			</Link>
		</article>
	);
}
