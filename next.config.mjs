/** @type {import('next').NextConfig} */

import { withAxiom } from "next-axiom";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withAxiom(nextConfig);
