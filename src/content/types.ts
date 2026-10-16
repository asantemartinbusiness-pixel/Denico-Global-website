/**
 * Provenance of a piece of public content.
 *
 * - observed:      Recorded from the public denicoglobal.com site (commissioning
 *                  brief, Oct 2026). Wording or structure is source-backed.
 * - registry:      Confirmed by Denico's entity records, for an entity that may
 *                  be named publicly.
 * - reconstructed: Written for the rebuild from observed positioning. The
 *                  original wording could not be recovered; approval required.
 */
export type Provenance = "observed" | "registry" | "reconstructed";

export interface Sourced {
  provenance: Provenance;
  /** Short reviewer note shown in review mode and listed in docs/content-migration.md. */
  note?: string;
}

export interface LinkItem {
  label: string;
  href: string;
}

export interface Pathway extends LinkItem {
  description: string;
}

export interface Slide extends Sourced {
  id: string;
  eyebrow: string;
  heading: string;
  body: string;
  cta: LinkItem;
}

export interface TextSection extends Sourced {
  id: string;
  heading: string;
  paragraphs: string[];
  points?: { title: string; body: string }[];
}

export type OwnershipStatus = "owned" | "majority_owned" | "minority_stake" | "pending_confirmation";

export interface PortfolioEntity extends Sourced {
  id: string;
  name: string;
  relationship: string;
  ownership: OwnershipStatus;
  sector: string;
  description: string;
  /** Only set when the entity's public website has been confirmed. */
  website?: string;
  enquiry: { label: string; href: string; email: string };
}

export interface ContactChannel extends Sourced {
  id: "general" | "press" | "studios";
  heading: string;
  description: string;
  email: string;
}
