import Link from "next/link";

type ConfigNoteProps = {
	apiBaseUrl: string;
};

export function ConfigNote({ apiBaseUrl }: ConfigNoteProps) {
	return (
		<section className="config-note">
			<p className="eyebrow">Missing publisher credentials</p>
			<h2>Configure publisher credentials to render storefront data</h2>
			<p>
				This example authenticates against Reach Orders on the server, so it
				needs publisher credentials in <code>.env.local</code>.
			</p>
			<div className="config-grid">
				<div>
					<strong>API base URL</strong>
					<p>{apiBaseUrl}</p>
				</div>
				<div>
					<strong>Required env vars</strong>
					<p>
						<code>PUBLISHER_API_BASE_URL</code>
						<br />
						<code>PUBLISHER_USERNAME</code>
						<br />
						<code>PUBLISHER_PASSWORD</code>
						<br />
						<code>ECWID_STORE_ID</code>
					</p>
				</div>
			</div>
			<p className="muted">
				The server signs in, keeps the access and refresh tokens in memory, and
				refreshes the session when needed before calling the protected
				<code>/storefront/*</code> endpoints.
			</p>
			<Link href="https://api.reachorders.com/api">
				Open Reach Orders API docs
			</Link>
		</section>
	);
}
