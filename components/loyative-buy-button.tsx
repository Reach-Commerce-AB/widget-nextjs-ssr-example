"use client";

import { useEffect } from "react";

type LoyativeBuyButtonProps = {
	productId: number;
	storeId: string;
	widgetUrl: string;
};

const addToBagProps = {
	customprop: "addtobag",
} as React.HTMLAttributes<HTMLDivElement>;

function ensureWidgetScript(storeId: string, widgetUrl: string) {
	if (typeof window === "undefined") {
		return Promise.resolve();
	}

	if (window.__loyativeWidgetLoadPromise) {
		return window.__loyativeWidgetLoadPromise;
	}

	window.__loyativeWidgetLoadPromise = new Promise<void>((resolve, reject) => {
		const existingScript = document.querySelector<HTMLScriptElement>(
			"#loyative-init-script",
		);

		if (existingScript) {
			if (existingScript.dataset.loaded === "true") {
				resolve();
				return;
			}

			existingScript.addEventListener("load", () => resolve(), { once: true });
			existingScript.addEventListener(
				"error",
				() => reject(new Error("Failed to load Loyative widget script")),
				{ once: true },
			);
			return;
		}

		const script = document.createElement("script");
		script.id = "loyative-init-script";
		script.async = true;
		script.src = `${widgetUrl}.js?${storeId}`;
		script.onload = () => {
			script.dataset.loaded = "true";
			resolve();
		};
		script.onerror = () =>
			reject(new Error("Failed to load Loyative widget script"));
		document.body.appendChild(script);
	});

	return window.__loyativeWidgetLoadPromise;
}

export function LoyativeBuyButton({
	productId,
	storeId,
	widgetUrl,
}: LoyativeBuyButtonProps) {
	useEffect(() => {
		let cancelled = false;
		const currentProductId = productId;

		ensureWidgetScript(storeId, widgetUrl)
			.then(() => {
				if (!cancelled && currentProductId) {
					window.xProduct?.();
				}
			})
			.catch((error) => {
				console.error(error);
			});

		return () => {
			cancelled = true;
		};
	}, [productId, storeId, widgetUrl]);

	return (
		<div
			className={`ecsp ecsp-SingleProduct-v2 ecsp-Product ec-Product-${productId}`}
			data-single-product-id={productId}
			itemType="http://schema.org/Product"
		>
			<div
				className="ecsp-title"
				content=""
				itemProp="name"
				style={{ display: "none" }}
			/>
			<div {...addToBagProps} />
		</div>
	);
}
