import Link from "next/link";
import { administrativeHours, contactChannels, legalNav, primaryNav, site } from "@/content/site";
import { Wordmark } from "./Wordmark";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={`${styles.footer} on-dark`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <Link href="/" className={styles.brand}>
            <Wordmark tone="light" />
            <span className="visually-hidden"> — home</span>
          </Link>
          <p className={styles.description}>{site.description}</p>
        </div>

        <nav aria-label="Footer" className={styles.column}>
          <h2 className={styles.heading}>Explore</h2>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.column}>
          <h2 className={styles.heading}>Contact</h2>
          <ul>
            {contactChannels.map((channel) => (
              <li key={channel.id}>
                <span className={styles.label}>{channel.heading}</span>
                <a href={`mailto:${channel.email}`}>{channel.email}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.column}>
          <h2 className={styles.heading}>Administrative hours</h2>
          <p>
            {administrativeHours.days}
            <br />
            {administrativeHours.time}
            <br />
            {administrativeHours.qualifier}
          </p>
        </div>
      </div>

      <div className={`container ${styles.base}`}>
        <p>© {year} Denico Global. All rights reserved.</p>
        <ul aria-label="Legal">
          {legalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
