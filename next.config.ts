import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const indexable = process.env.SITE_ENV === "production";

// Next.js injects inline bootstrap scripts into statically generated pages.
// A nonce-based policy would force every page to render dynamically, so the
// static-first build uses 'unsafe-inline' for scripts and styles. No third-party
// origins are permitted. See docs/security-review.md (SEC-03).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
  ...(indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
];

const nextConfig: NextConfig = {
  // Preserves the WordPress URL shape (/our-story/, /companies-2/ …).
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
  async redirects() {
    // WordPress serves an RSS feed at /feed/ by default; the rebuild publishes
    // no feed. Proposed route changes await approval in docs/seo-and-redirects.md.
    return [{ source: "/feed/", destination: "/", permanent: true }];
  },
};

export default nextConfig;
