/** @type {import('next').NextConfig} */
const nextConfig = {
    // Reduce unnecessary recompilations
    reactStrictMode: false,

    // Faster image loading
    images: {
        minimumCacheTTL: 86400,
        formats: ['image/webp'],
    },

    // Compiler optimizations
    compiler: {
        removeConsole: false,
    },

    // Turbopack is already on via next dev --turbo, this just ensures stable defaults
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },
    // ── CORS CONFIGURATION ────────────────────────────────────────────────
    // This allows your Vercel frontend to talk to your Render backend API
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // Change this to your exact Vercel URL in production for extra security
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    }
};

module.exports = nextConfig;
