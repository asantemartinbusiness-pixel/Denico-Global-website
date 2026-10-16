import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { indexable } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (!indexable) {
    // Preview, test and local builds must never be indexed.
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
