import type { TextSection } from "@/content/types";
import { Provenance } from "./Provenance";
import styles from "./TextBlock.module.css";

/** Editorial two-column section: heading left, text and points right. */
export function TextBlock({ section, index }: { section: TextSection; index?: number }) {
  const headingId = `${section.id}-heading`;
  return (
    <section id={section.id} className={styles.section} aria-labelledby={headingId}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.aside}>
          {index !== undefined ? (
            <span className={styles.index} aria-hidden="true">
              {String(index).padStart(2, "0")}
            </span>
          ) : null}
          <h2 id={headingId} className={styles.heading}>
            {section.heading}
          </h2>
        </div>
        <div className={styles.body}>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
          {section.points?.length ? (
            <ul className={styles.points}>
              {section.points.map((point) => (
                <li key={point.title}>
                  <h3 className={styles.pointTitle}>{point.title}</h3>
                  <p>{point.body}</p>
                </li>
              ))}
            </ul>
          ) : null}
          <Provenance kind={section.provenance} note={section.note} />
        </div>
      </div>
    </section>
  );
}
