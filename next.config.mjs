/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com", "lh3.googleusercontent.com","utfs.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn3.iconfinder.com",
      },
      {
        protocol: "https",
        hostname: "cdn4.iconfinder.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
    ],
  },
};

export default nextConfig;
