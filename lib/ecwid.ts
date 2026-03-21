type EcwidImage = {
	image800pxUrl?: string;
	imageOriginalUrl?: string;
};

export type EcwidProduct = {
	id: number;
	name: string;
	defaultDisplayedPriceFormatted?: string;
	description?: string;
	inStock?: boolean;
	sku?: string;
	media?: {
		images?: EcwidImage[];
	};
	originalImageUrl?: string;
	thumbnailUrl?: string;
};

type EcwidProductsResponse = {
	items: EcwidProduct[];
};

const storeId = process.env.ECWID_STORE_ID ?? "87218280";
const publicToken = process.env.ECWID_PUBLIC_TOKEN;
const secretToken = process.env.ECWID_SECRET_TOKEN;

function getAuthHeaders() {
	const token = secretToken ?? publicToken;

	if (!token) {
		return null;
	}

	return {
		Authorization: `Bearer ${token}`,
	};
}

function getImageUrl(product: EcwidProduct) {
	return (
		product.media?.images?.[0]?.image800pxUrl ??
		product.originalImageUrl ??
		product.thumbnailUrl ??
		null
	);
}

export function getEcwidConfig() {
	return {
		storeId,
		hasApiToken: Boolean(publicToken || secretToken),
		tokenMode: secretToken ? "secret" : publicToken ? "public" : "missing",
	};
}

export function getEcwidProductImage(product: EcwidProduct) {
	return getImageUrl(product);
}

export async function listEcwidProducts(limit = 12) {
	const headers = getAuthHeaders();

	if (!headers) {
		return [];
	}

	const response = await fetch(
		`https://app.ecwid.com/api/v3/${storeId}/products?limit=${limit}&enabled=true&responseFields=items(id,name,defaultDisplayedPriceFormatted,description,inStock,sku,thumbnailUrl,originalImageUrl,media)`,
		{
			headers,
			cache: "no-store",
		},
	);

	if (!response.ok) {
		throw new Error(
			`Ecwid product list request failed with ${response.status}`,
		);
	}

	const payload = (await response.json()) as EcwidProductsResponse;
	return payload.items ?? [];
}

export async function getEcwidProduct(productId: string) {
	const headers = getAuthHeaders();

	if (!headers) {
		return null;
	}

	const response = await fetch(
		`https://app.ecwid.com/api/v3/${storeId}/products/${productId}?responseFields=id,name,defaultDisplayedPriceFormatted,description,inStock,sku,thumbnailUrl,originalImageUrl,media`,
		{
			headers,
			cache: "no-store",
		},
	);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error(`Ecwid product request failed with ${response.status}`);
	}

	return (await response.json()) as EcwidProduct;
}
