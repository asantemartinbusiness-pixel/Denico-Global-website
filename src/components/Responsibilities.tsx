import type { Provenance as ProvenanceKind } from "@/content/types";
import { Provenance } from "./Provenance";
import styles from "./Responsibilities.module.css";

interface Column {
  heading: string;
  items: string[];
}

export function Responsibilities({
  heading,
  intro,
  group,
  company,
  provenance,
  note,
}: {
  heading: string;
  intro: string;
  group: Column;
  company: Column;
  provenance: ProvenanceKind;
  note?: string;
}) {
  return (
    <section className={styles.section} aria-labelledby="responsibilities-heading">
      <div className="container">
        <h2 id="responsibilities-heading" className={styles.heading}>
          {heading}
        </h2>
        <p className={styles.intro}>{intro}</p>
        <div className={styles.columns}>
          {[group, company].map((column) => (
            <div key={column.heading} className={styles.column}>
              <h3 className={styles.columnHeading}>{column.heading}</h3>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Provenance kind={provenance} note={note} />
      </div>
    </section>
  );
}
