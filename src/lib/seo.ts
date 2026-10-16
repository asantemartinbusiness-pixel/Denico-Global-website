import type { Metadata } from "next";
import { site } from "@/content/site";

export const indexable = process.env.SITE_ENV === "production";

export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title?: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} — Long-term holding company`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.locale,
      url: path,
      title: fullTitle,
      description,
      // Explicit, because page-level openGraph replaces the inherited image.
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Denico Global — long-term holding company" }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: ["/opengraph-image"] },
    robots: indexable && !noindex ? { index: true, follow: true } : { index: false, follow: !noindex },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: `${site.url}/`,
    description: site.description,
    email: "info@denicoglobal.com",
  };
}
