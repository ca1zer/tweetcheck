import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Twitter Influence Explorer",
	description: "Analyze Twitter user influence using PageRank",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" className="dark">
			<body className={`${inter.className} antialiased bg-dark-950`}>
				<div className="fixed inset-0">
					<div className="absolute inset-0 bg-dark-950" />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neon-purple/10 via-transparent to-transparent opacity-30" />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-neon-blue/10 via-transparent to-transparent opacity-30" />
					<div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-neon-green/5 via-transparent to-transparent opacity-20" />
					<div className="absolute inset-0 backdrop-blur-2xl" />
					<div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />
				</div>
				<div className="relative">{children}</div>
			</body>
		</html>
	);
}
