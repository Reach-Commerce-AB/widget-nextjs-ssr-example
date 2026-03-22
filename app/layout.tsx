import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Loyative Storefront SSR Example",
	description:
		"Loyative widget plus Loyative storefront API rendered through Next.js SSR.",
};

type RootLayoutProps = {
	children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
