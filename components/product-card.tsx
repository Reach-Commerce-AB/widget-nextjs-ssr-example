/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { type EcwidProduct, getEcwidProductImage } from "@/lib/ecwid";

type ProductCardProps = {
	product: EcwidProduct;
};

export function ProductCard({ product }: ProductCardProps) {
	const imageUrl = getEcwidProductImage(product);

	return (
		<article className="product-card">
			{imageUrl ? (
				<img alt={product.name} className="product-image" src={imageUrl} />
			) : (
				<div className="product-image product-image-fallback">No image</div>
			)}
			<div className="product-copy">
				<p className="product-meta">
					{product.sku ? `SKU ${product.sku}` : "Ecwid product"}
				</p>
				<h2>{product.name}</h2>
				<p className="product-price">
					{product.defaultDisplayedPriceFormatted ?? "Price unavailable"}
				</p>
				<p className={product.inStock ? "stock stock-in" : "stock stock-out"}>
					{product.inStock ? "In stock" : "Out of stock"}
				</p>
				<Link href={`/products/${product.id}`}>Open SSR detail page</Link>
			</div>
		</article>
	);
}
