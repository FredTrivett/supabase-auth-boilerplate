/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000']
        }
    },
    env: {
        RESEND_API_KEY: process.env.RESEND_API_KEY,
    },
}

module.exports = nextConfig 