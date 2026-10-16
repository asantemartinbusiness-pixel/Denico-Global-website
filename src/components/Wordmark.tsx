import styles from "./Wordmark.module.css";

/**
 * Typographic wordmark. PROVISIONAL: the original Denico Global logo could not
 * be recovered (asset AM-01). Replace with the approved logo file when supplied.
 */
export function Wordmark({ tone = "ink" }: { tone?: "ink" | "light" }) {
  return (
    <span className={`${styles.wordmark} ${tone === "light" ? styles.light : ""}`}>
      <span className={styles.primary}>Denico</span>{" "}
      <span className={styles.secondary}>Global</span>
    </span>
  );
}
