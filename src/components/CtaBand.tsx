import { LinkButton } from "./LinkButton";
import styles from "./CtaBand.module.css";

export function CtaBand({
  heading,
  body,
  action,
}: {
  heading: string;
  body: string;
  action: { label: string; href: string };
}) {
  return (
    <section className={`${styles.band} on-dark`} aria-labelledby="cta-heading">
      <div className={`container ${styles.inner}`}>
        <div>
          <h2 id="cta-heading" className={styles.heading}>
            {heading}
          </h2>
          <p className={styles.body}>{body}</p>
        </div>
        <LinkButton href={action.href} variant="light">
          {action.label}
        </LinkButton>
      </div>
    </section>
  );
}
