/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,jsx,mdx}",
		"./src/components/**/*.{js,jsx,mdx}",
		"./src/app/**/*.{js,jsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				primary: "var(--primary)",
				"primary-dark": "var(--primary-dark)",
				secondary: "var(--secondary)",
				accent: "var(--accent)",
				background: "var(--background)",
				foreground: "var(--foreground)",
			},
			animation: {
				gradient: "gradient 8s linear infinite",
				"spin-slow": "spin 3s linear infinite",
			},
			keyframes: {
				gradient: {
					"0%, 100%": {
						"background-size": "200% 200%",
						"background-position": "left center",
					},
					"50%": {
						"background-size": "200% 200%",
						"background-position": "right center",
					},
				},
			},
		},
	},
	plugins: [],
};
