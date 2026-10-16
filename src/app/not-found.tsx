import type { Metadata } from "next";
import { LinkButton } from "@/components/LinkButton";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found | Denico Global",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className={`container ${styles.wrap}`} aria-labelledby="nf-title">
      <p className="eyebrow">Error 404</p>
      <h1 id="nf-title" className={styles.title}>
        This page could not be found
      </h1>
      <p className={styles.body}>
        The page may have moved, or the address may be incorrect. Some pages from the previous website have not been
        carried over.
      </p>
      <div className={styles.actions}>
        <LinkButton href="/">Go to the homepage</LinkButton>
        <LinkButton href="/contact/" variant="secondary">
          Contact us
        </LinkButton>
      </div>
    </section>
  );
}
