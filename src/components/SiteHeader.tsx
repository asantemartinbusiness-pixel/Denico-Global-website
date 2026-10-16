"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { primaryNav } from "@/content/site";
import { Wordmark } from "./Wordmark";
import styles from "./SiteHeader.module.css";

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Close the menu whenever the route changes (adjusting state during render).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("a")?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      // Keep focus within the toggle and the open menu.
      const focusable = [toggleRef.current, ...panel.querySelectorAll<HTMLElement>("a")].filter(
        (el): el is HTMLElement => el !== null,
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    function onResize() {
      if (window.matchMedia("(min-width: 60em)").matches) close(false);
    }

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  return (
    <header className={styles.header} data-open={open || undefined}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.brand}>
          <Wordmark />
          <span className="visually-hidden"> — home</span>
        </Link>

        <nav aria-label="Primary" className={styles.desktopNav}>
          <ul>
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  className={styles.navLink}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className={styles.toggleLabel}>{open ? "Close" : "Menu"}</span>
          <span aria-hidden="true" className={styles.toggleIcon} />
        </button>
      </div>

      <div
        ref={panelRef}
        id="mobile-menu"
        className={styles.panel}
        hidden={!open}
      >
        <nav aria-label="Mobile" className="container">
          <ul className={styles.mobileList}>
            <li>
              <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={styles.mobileLink} onClick={() => setOpen(false)}>
                Home
              </Link>
            </li>
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  className={styles.mobileLink}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
