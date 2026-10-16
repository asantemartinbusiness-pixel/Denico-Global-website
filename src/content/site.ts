import type { ContactChannel, LinkItem } from "./types";

export const site = {
  name: "Denico Global",
  /** Publicly observed positioning; the canonical one-line description. */
  description:
    "Denico Global is a long-term holding company combining disciplined capital allocation with active operational oversight.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://denicoglobal.com").replace(/\/$/, ""),
  locale: "en_GB",
} as const;

export const primaryNav: LinkItem[] = [
  { label: "Our Story", href: "/our-story/" },
  { label: "Inside Denico", href: "/inside-denico/" },
  { label: "Portfolio", href: "/companies-2/" },
  { label: "Contact", href: "/contact/" },
];

export const legalNav: LinkItem[] = [{ label: "Privacy notice", href: "/privacy/" }];

/**
 * Contact destinations observed on the public Contact page.
 * The live page displayed info@ but linked to a different address (defect
 * DEF-001). The rebuild uses the displayed address for both text and link;
 * recipient routing must be confirmed before production.
 */
export const contactChannels: ContactChannel[] = [
  {
    id: "general",
    heading: "Group and business enquiries",
    description: "Enquiries about Denico Global and the businesses in the group.",
    email: "info@denicoglobal.com",
    provenance: "observed",
    note: "Address observed; displayed text and link target did not match on the live site (DEF-001).",
  },
  {
    id: "press",
    heading: "Press and media",
    description: "Media requests and press information.",
    email: "press@denicoglobal.com",
    provenance: "observed",
  },
  {
    id: "studios",
    heading: "Denico Studios enquiries",
    description: "Enquiries for Denico Studios.",
    email: "studio@denicoglobal.com",
    provenance: "observed",
    note: "Address observed. Heading renamed from the live site’s “Denico Studio” to the company name “Denico Studios” (OD-04).",
  },
];

export const administrativeHours = {
  days: "Monday to Friday",
  time: "9:00 AM – 5:00 PM",
  qualifier: "By appointment only",
  /** Not stated on the source page — see OD-05. */
  timezone: null as string | null,
  provenance: "observed" as const,
};
