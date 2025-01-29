/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,mdx}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				neon: {
					blue: "#00F0FF",
					purple: "#BD00FF",
					pink: "#FF2E9E",
					green: "#00FF94",
				},
				dark: {
					800: "#0A0A0B",
					900: "#050506",
					950: "#020203",
				},
				white: "#ffffff",
			},
			boxShadow: {
				neon: "0 0 20px var(--tw-shadow-color)",
				"neon-lg": "0 0 30px var(--tw-shadow-color)",
			},
			animation: {
				gradient: "gradient 8s linear infinite",
				"spin-slow": "spin 3s linear infinite",
				float: "float 3s ease-in-out infinite",
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
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" },
				},
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [],
};
