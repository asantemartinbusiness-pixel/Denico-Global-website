import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

const routes = ["/", "/our-story/", "/inside-denico/", "/companies-2/", "/contact/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
