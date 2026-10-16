import type { Provenance as ProvenanceKind } from "@/content/types";
import { Provenance } from "./Provenance";
import styles from "./PageHero.module.css";

export function PageHero({
  eyebrow,
  title,
  lede,
  provenance,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  provenance?: ProvenanceKind;
}) {
  return (
    <section className={styles.hero} aria-labelledby="page-title">
      <div className={`container ${styles.inner}`}>
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="page-title" className={styles.title}>
          {title}
        </h1>
        <p className={styles.lede}>{lede}</p>
        {provenance ? <Provenance kind={provenance} /> : null}
      </div>
    </section>
  );
}
