import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Reach Orders Storefront SSR Example",
	description:
		"Loyative widget plus Reach Orders storefront API rendered through Next.js SSR.",
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
