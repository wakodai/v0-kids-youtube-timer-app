/** @type {import('next').NextConfig} */

// GitHub Pages のプロジェクトページ用 basePath。
// CI では NEXT_PUBLIC_BASE_PATH を渡し、ローカル dev では空文字にする。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default nextConfig
