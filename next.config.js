/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
	},
	images: {
		remotePatterns: [
			{
				hostname: "images.clerk.dev",
			},
		],
	},
};

module.exports = nextConfig;
