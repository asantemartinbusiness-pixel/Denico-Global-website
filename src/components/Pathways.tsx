import Link from "next/link";
import type { Pathway } from "@/content/types";
import styles from "./Pathways.module.css";

export function Pathways({
  heading,
  items,
  id = "pathways",
}: {
  heading: string;
  items: Pathway[];
  id?: string;
}) {
  return (
    <section className={styles.section} aria-labelledby={`${id}-heading`}>
      <div className="container">
        <h2 id={`${id}-heading`} className={styles.heading}>
          {heading}
        </h2>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.card}>
                <span className={styles.label}>{item.label}</span>
                <span className={styles.description}>{item.description}</span>
                <span aria-hidden="true" className={styles.arrow}>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
