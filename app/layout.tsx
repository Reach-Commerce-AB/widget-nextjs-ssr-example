import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Ecwid Full SSR Example",
	description:
		"Headless Ecwid SSR example powered by Next.js server rendering.",
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
