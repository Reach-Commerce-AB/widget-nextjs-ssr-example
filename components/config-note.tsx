import Link from "next/link";

type ConfigNoteProps = {
	storeId: string;
};

export function ConfigNote({ storeId }: ConfigNoteProps) {
	return (
		<section className="config-note">
			<p className="eyebrow">Missing ECWID_PUBLIC_TOKEN</p>
			<h2>Configure a public token to render real SSR product data</h2>
			<p>
				This example is built for server-side rendering via Ecwid REST API, so
				it needs a public token in <code>.env.local</code>.
			</p>
			<div className="config-grid">
				<div>
					<strong>Store ID</strong>
					<p>{storeId}</p>
				</div>
				<div>
					<strong>Required env vars</strong>
					<p>
						<code>ECWID_STORE_ID</code>
						<br />
						<code>ECWID_PUBLIC_TOKEN</code>
						<br />
						<code>ECWID_SECRET_TOKEN</code>
					</p>
				</div>
			</div>
			<p className="muted">
				Use a public token if it has the access you need. If Ecwid returns 403,
				you can use a secret token here because this app reads it only on the
				server. Once configured, the HTML for this page will already contain
				Ecwid product names, prices, and descriptions from the server response.
			</p>
			<Link href="https://support.ecwid.com/hc/en-us/articles/13087127122204-Selling-on-Next-js-Commerce-with-Ecwid">
				Open Ecwid headless guide
			</Link>
		</section>
	);
}
