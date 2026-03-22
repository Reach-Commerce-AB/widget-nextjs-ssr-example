type JwtPayload = {
	exp?: number;
};

type SignInResponse = {
	accessToken: string;
	refreshToken: string;
};

export type VisibleCategory = {
	id: number | string;
	name: string;
};

type CampaignVariantSnapshot = {
	discountPrice?: number;
	imageUrl?: string | null;
	liveStockCount?: number | null;
	price?: number;
	stockCount?: number | null;
};

export type StorefrontProduct = {
	id: string;
	brand?: string;
	description?: string;
	imageUrls?: string[];
	name: string;
	storeProductId: string;
	campaignVariantSnapshots?: CampaignVariantSnapshot[];
};

type CategoryProductsResponse = {
	results: StorefrontProduct[];
	total: number;
};

type SessionState = {
	accessToken: string;
	accessTokenExpiresAt: number | null;
	refreshToken: string;
	refreshTokenExpiresAt: number | null;
};

const rawPublisherApiBaseUrl =
	process.env.PUBLISHER_API_BASE_URL ?? "https://api.reachorders.com";
const publisherPassword = process.env.PUBLISHER_PASSWORD;
const publisherUsername = process.env.PUBLISHER_USERNAME;
const storefrontImageBaseUrl =
	"https://s3.eu-north-1.amazonaws.com/reach.images";

function normalizePublisherApiBaseUrl(baseUrl: string) {
	const trimmed = baseUrl.trim().replace(/\/+$/, "");

	// The Swagger docs are served from `/api`, but the actual auth/storefront
	// endpoints are mounted at the origin root.
	return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
}

const publisherApiBaseUrl = normalizePublisherApiBaseUrl(
	rawPublisherApiBaseUrl,
);

let sessionState: SessionState | null = null;

function decodeJwtExpiry(token: string) {
	const parts = token.split(".");

	if (parts.length < 2) {
		return null;
	}

	try {
		const payload = JSON.parse(
			Buffer.from(parts[1], "base64url").toString("utf8"),
		) as JwtPayload;
		return payload.exp ? payload.exp * 1000 : null;
	} catch {
		return null;
	}
}

function isTokenUsable(expiresAt: number | null) {
	if (!expiresAt) {
		return true;
	}

	return expiresAt - Date.now() > 30_000;
}

function createSessionState(payload: SignInResponse): SessionState {
	return {
		accessToken: payload.accessToken,
		accessTokenExpiresAt: decodeJwtExpiry(payload.accessToken),
		refreshToken: payload.refreshToken,
		refreshTokenExpiresAt: decodeJwtExpiry(payload.refreshToken),
	};
}

async function signIn() {
	if (!publisherUsername || !publisherPassword) {
		return null;
	}

	const response = await fetch(`${publisherApiBaseUrl}/auth/sign-in`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email: publisherUsername,
			password: publisherPassword,
		}),
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(`Publisher sign-in failed with ${response.status}`);
	}

	const payload = (await response.json()) as SignInResponse;
	sessionState = createSessionState(payload);
	return sessionState;
}

async function refreshSession() {
	if (
		!sessionState?.accessToken ||
		!sessionState.refreshToken ||
		!isTokenUsable(sessionState.refreshTokenExpiresAt)
	) {
		return signIn();
	}

	const response = await fetch(`${publisherApiBaseUrl}/auth/refresh`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${sessionState.accessToken}`,
			Refresh: sessionState.refreshToken,
		},
		cache: "no-store",
	});

	if (!response.ok) {
		return signIn();
	}

	const payload = (await response.json()) as Partial<SignInResponse>;
	sessionState = {
		accessToken: payload.accessToken ?? sessionState.accessToken,
		accessTokenExpiresAt: decodeJwtExpiry(
			payload.accessToken ?? sessionState.accessToken,
		),
		refreshToken: payload.refreshToken ?? sessionState.refreshToken,
		refreshTokenExpiresAt: decodeJwtExpiry(
			payload.refreshToken ?? sessionState.refreshToken,
		),
	};

	return sessionState;
}

async function getSession() {
	if (!publisherUsername || !publisherPassword) {
		return null;
	}

	if (!sessionState) {
		return signIn();
	}

	if (isTokenUsable(sessionState.accessTokenExpiresAt)) {
		return sessionState;
	}

	return refreshSession();
}

async function storefrontFetch<T>(path: string): Promise<T> {
	const session = await getSession();

	if (!session) {
		throw new Error("Publisher credentials are missing");
	}

	const response = await fetch(`${publisherApiBaseUrl}${path}`, {
		headers: {
			Authorization: `Bearer ${session.accessToken}`,
		},
		cache: "no-store",
	});

	if (response.status === 401) {
		const refreshedSession = await refreshSession();

		if (!refreshedSession) {
			throw new Error("Unable to refresh publisher session");
		}

		const retryResponse = await fetch(`${publisherApiBaseUrl}${path}`, {
			headers: {
				Authorization: `Bearer ${refreshedSession.accessToken}`,
			},
			cache: "no-store",
		});

		if (!retryResponse.ok) {
			throw new Error(
				`Storefront request failed with ${retryResponse.status} after refresh`,
			);
		}

		return (await retryResponse.json()) as T;
	}

	if (!response.ok) {
		throw new Error(`Storefront request failed with ${response.status}`);
	}

	return (await response.json()) as T;
}

function formatCategorySlug(name: string) {
	return name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function getPrimarySnapshot(product: StorefrontProduct) {
	return product.campaignVariantSnapshots?.[0] ?? null;
}

export function getStorefrontProductAvailability(product: StorefrontProduct) {
	const snapshots = product.campaignVariantSnapshots ?? [];

	if (snapshots.length === 0) {
		return {
			label: "Availability unknown",
			tone: "unknown" as const,
		};
	}

	let hasUnlimitedAvailability = false;
	let hasPositiveStock = false;
	let hasKnownStockValue = false;

	for (const snapshot of snapshots) {
		const stockValue = snapshot.liveStockCount ?? snapshot.stockCount;

		if (stockValue === null) {
			hasUnlimitedAvailability = true;
			continue;
		}

		if (typeof stockValue === "number") {
			hasKnownStockValue = true;

			if (stockValue > 0) {
				hasPositiveStock = true;
			}
		}
	}

	if (hasPositiveStock) {
		return {
			label: "In stock",
			tone: "in" as const,
		};
	}

	if (hasUnlimitedAvailability) {
		return {
			label: "Unlimited availability",
			tone: "unlimited" as const,
		};
	}

	if (hasKnownStockValue) {
		return {
			label: "Out of stock",
			tone: "out" as const,
		};
	}

	return {
		label: "Availability unknown",
		tone: "unknown" as const,
	};
}

export function getStorefrontConfig() {
	return {
		apiBaseUrl: publisherApiBaseUrl,
		hasCredentials: Boolean(publisherUsername && publisherPassword),
	};
}

export function getCategorySlug(category: VisibleCategory) {
	return formatCategorySlug(category.name);
}

export function getDisplayCategoryName(categorySlug: string) {
	return categorySlug
		.split("-")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function getStorefrontProductImage(product: StorefrontProduct) {
	const primaryImageUrl = product.imageUrls?.[0];

	if (primaryImageUrl) {
		return resolveStorefrontImageUrl(primaryImageUrl);
	}

	const snapshotImageUrl = getPrimarySnapshot(product)?.imageUrl;

	return snapshotImageUrl ? resolveStorefrontImageUrl(snapshotImageUrl) : null;
}

function resolveStorefrontImageUrl(imageUrl: string) {
	if (/^https?:\/\//i.test(imageUrl)) {
		return imageUrl;
	}

	return `${storefrontImageBaseUrl}/${imageUrl.replace(/^\/+/, "")}`;
}

export function getStorefrontProductPrice(product: StorefrontProduct) {
	const snapshot = getPrimarySnapshot(product);
	const price = snapshot?.discountPrice ?? snapshot?.price;

	if (typeof price !== "number") {
		return "Price unavailable";
	}

	return new Intl.NumberFormat("sv-SE", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	}).format(price);
}

export async function listTopLevelCategories() {
	return storefrontFetch<VisibleCategory[]>(
		"/storefront/all-visible-top-level-categories",
	);
}

export async function listProductsForCategory(categoryId: string) {
	const payload = await storefrontFetch<CategoryProductsResponse>(
		`/storefront/category/${categoryId}/products`,
	);

	return payload.results ?? [];
}

export async function getCategoryProduct(params: {
	categoryId: string;
	productId: string;
}) {
	const products = await listProductsForCategory(params.categoryId);

	return (
		products.find(
			(product) =>
				product.storeProductId === params.productId ||
				product.id === params.productId,
		) ?? null
	);
}
