import type { Provenance as ProvenanceKind } from "@/content/types";
import styles from "./Provenance.module.css";

const reviewMode = process.env.NEXT_PUBLIC_REVIEW_MODE === "1";

const labels: Record<ProvenanceKind, string> = {
  observed: "Source: observed on live site",
  registry: "Source: Entity Registry",
  reconstructed: "Reconstructed copy — approval required",
};

/** Content-review aid. Renders nothing unless NEXT_PUBLIC_REVIEW_MODE=1. */
export function Provenance({ kind, note }: { kind: ProvenanceKind; note?: string }) {
  if (!reviewMode) return null;
  return (
    <p className={`${styles.tag} ${styles[kind]}`} data-provenance={kind}>
      <strong>{labels[kind]}</strong>
      {note ? <span> · {note}</span> : null}
    </p>
  );
}
