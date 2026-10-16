import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./LinkButton.module.css";

type Variant = "primary" | "secondary" | "light" | "text";

export function LinkButton({
  variant = "primary",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link className={`${styles.button} ${styles[variant]} ${className ?? ""}`} {...props}>
      <span>{children}</span>
      <span aria-hidden="true" className={styles.arrow}>
        →
      </span>
    </Link>
  );
}
