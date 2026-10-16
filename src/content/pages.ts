import type { Pathway, PortfolioEntity, Slide, TextSection } from "./types";

/* ------------------------------------------------------------------ */
/* Shared pathways                                                     */
/* ------------------------------------------------------------------ */

export const pathways: Record<"story" | "inside" | "portfolio" | "contact", Pathway> = {
  story: {
    label: "Our Story",
    href: "/our-story/",
    description: "Who we are, our approach and where we focus.",
  },
  inside: {
    label: "Inside Denico Global",
    href: "/inside-denico/",
    description: "How the group is organised and how oversight works.",
  },
  portfolio: {
    label: "Group Portfolio Overview",
    href: "/companies-2/",
    description: "The businesses that form the Denico group.",
  },
  contact: {
    label: "Business Enquiries",
    href: "/contact/",
    description: "Group, media and Denico Studios enquiries.",
  },
};

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */

// The live homepage opened with a large slider on three themes. Exact slide
// wording could not be recovered; headings are reconstructed from those themes.
export const homeSlides: Slide[] = [
  {
    id: "disciplined-execution",
    eyebrow: "Disciplined execution",
    heading: "Disciplined capital. Clear operations.",
    body: "We allocate capital with discipline and stay close to how each business is run.",
    cta: { label: "Read our story", href: "/our-story/" },
    provenance: "reconstructed",
    note: "Theme observed (disciplined execution / capital, operational clarity); wording reconstructed.",
  },
  {
    id: "long-term-thinking",
    eyebrow: "Long-term thinking",
    heading: "Built for the long term.",
    body: "We hold and develop businesses with patience, measuring progress in years rather than quarters.",
    cta: { label: "Inside Denico Global", href: "/inside-denico/" },
    provenance: "reconstructed",
    note: "Theme observed (long-term thinking / long-term value); wording reconstructed.",
  },
  {
    id: "enduring-brands",
    eyebrow: "Enduring brands",
    heading: "Building enduring brands.",
    body: "We support businesses in building brands and enterprise value that last.",
    cta: { label: "View the group portfolio", href: "/companies-2/" },
    provenance: "reconstructed",
    note: "Theme observed (building enduring brands); wording reconstructed.",
  },
];

export const homeIntro: TextSection = {
  id: "overview",
  heading: "A long-term holding company",
  paragraphs: [
    "Denico Global is a long-term holding company. We combine disciplined capital allocation with active operational oversight, supporting businesses built to create enduring value.",
    "Each business Denico Global owns keeps its own identity and leadership, while the group provides direction, accountability and long-term commitment.",
  ],
  provenance: "reconstructed",
  note: "Composed from observed positioning statements; first sentence matches the observed Our Story description.",
};

export const homePrinciples: TextSection = {
  id: "principles",
  heading: "How we work",
  paragraphs: [],
  points: [
    {
      title: "Disciplined capital allocation",
      body: "Capital is committed with care and a clear strategic purpose.",
    },
    {
      title: "Strategic and operational alignment",
      body: "Each business pursues its own strategy, aligned with the direction of the group.",
    },
    {
      title: "Active portfolio oversight",
      body: "We stay close to the businesses we support, with clear accountability and regular review.",
    },
    {
      title: "Long-term value",
      body: "We favour sustainable development and enduring brand and enterprise value over short-term results.",
    },
  ],
  provenance: "reconstructed",
  note: "Point titles follow the observed public positioning; descriptions reconstructed.",
};

/* ------------------------------------------------------------------ */
/* Our Story                                                           */
/* ------------------------------------------------------------------ */

export const storyLede = {
  text: "Denico Global is a long-term holding company combining disciplined capital allocation with active operational oversight.",
  provenance: "observed" as const,
};

export const storySections: TextSection[] = [
  {
    id: "our-approach",
    heading: "Our Approach",
    paragraphs: [
      "We take a long-term view of ownership. Capital is allocated with discipline, and we remain actively involved in how businesses are run: setting direction, maintaining oversight and holding consistent standards.",
      "Group-level oversight does not replace the independence of each business. A business owned by Denico Global keeps its own identity, leadership and customers, while drawing on the structure, accountability and commitment of the group.",
    ],
    provenance: "reconstructed",
    note: "Section title observed; body reconstructed. Preserves the group-oversight / business-independence distinction.",
  },
  {
    id: "our-focus",
    heading: "Our Focus",
    paragraphs: [
      "Our focus is on businesses with the potential to create enduring value, and on strengthening them over time through strategic alignment, operational development and careful stewardship of the brands they build.",
    ],
    points: [
      { title: "Sustainable business development", body: "Growth that the organisation underneath it can support." },
      { title: "Operational resilience", body: "Businesses that run consistently and withstand pressure." },
      { title: "Enduring brand and enterprise value", body: "Reputation and value built steadily, over the long term." },
    ],
    provenance: "reconstructed",
    note: "Section title observed; body reconstructed from observed positioning.",
  },
];

/* ------------------------------------------------------------------ */
/* Inside Denico Global                                                */
/* ------------------------------------------------------------------ */

export const insideLede = {
  text: "How the group is organised, and how group oversight and the independence of each business work together.",
  provenance: "reconstructed" as const,
};

export const insideStructure: TextSection = {
  id: "group-structure",
  heading: "The group",
  paragraphs: [
    "Denico Global is the holding company at the centre of the group. It sets direction, allocates capital and maintains oversight. Each operating company it owns runs its own business.",
  ],
  provenance: "reconstructed",
  note: "Original Inside Denico content not recoverable. Structure statement consistent with the Entity Registry.",
};

export const insideResponsibilities = {
  provenance: "reconstructed" as const,
  note: "Division of responsibilities is a draft; confirmation required (OD-07).",
  group: {
    heading: "At group level",
    items: ["Capital allocation", "Strategic alignment", "Governance and accountability", "Active oversight"],
  },
  company: {
    heading: "Within each business",
    items: ["Its own identity and brand", "Its customers and propositions", "Its leadership and teams", "Day-to-day operations"],
  },
};

export const insidePrinciples: TextSection = {
  id: "operating-principles",
  heading: "Operating principles",
  paragraphs: [],
  points: [
    { title: "Consistency", body: "Clear standards, applied the same way over time." },
    { title: "Control", body: "Clear decision-making and accountability across the group." },
    { title: "Operational resilience", body: "Businesses built to run well under pressure, not only in good conditions." },
  ],
  provenance: "reconstructed",
  note: "Principle names follow observed positioning (consistency, control, operational resilience); descriptions reconstructed.",
};

/* ------------------------------------------------------------------ */
/* Group portfolio                                                     */
/* ------------------------------------------------------------------ */

export const portfolioLede = {
  text: "The businesses that form the Denico group. Only companies whose relationship to Denico Global has been confirmed are listed.",
  provenance: "reconstructed" as const,
};

export const portfolioEntities: PortfolioEntity[] = [
  {
    id: "denico-studios",
    name: "Denico Studios",
    relationship: "Operating company of Denico Global",
    ownership: "owned",
    sector: "Strategy, creative and digital",
    description: "A strategy-led creative and digital studio, and an operating company of Denico Global.",
    enquiry: {
      label: "Enquire with Denico Studios",
      href: "/contact/?enquiry=studios#enquiry-form",
      email: "studio@denicoglobal.com",
    },
    provenance: "registry",
    note: "Relationship and name confirmed by Denico's entity records. Description wording needs approval. No website is linked because none is confirmed.",
  },
];

export const studiosClarification = {
  text: "Work that Denico Studios carries out for a client does not make that client part of the Denico group.",
  provenance: "reconstructed" as const,
  note: "Protective clarification; wording needs approval.",
};
