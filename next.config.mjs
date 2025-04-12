let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    // parallelServerBuildTraces: true,
    // parallelServerCompiles: true,
  },
}

// Merge configs properly
if (userConfig && userConfig.default) {
  const userConfigObj = userConfig.default
  
  for (const key in userConfigObj) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfigObj[key],
      }
    } else {
      nextConfig[key] = userConfigObj[key]
    }
  }
}

export default nextConfig