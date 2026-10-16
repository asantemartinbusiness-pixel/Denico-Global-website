"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Slide } from "@/content/types";
import { Provenance } from "./Provenance";
import styles from "./HeroSlider.module.css";

const INTERVAL_MS = 7000;
const SWIPE_THRESHOLD_PX = 48;

export function HeroSlider({
  slides,
  label,
  title,
  tagline,
}: {
  slides: Slide[];
  label: string;
  title: string;
  tagline: string;
}) {
  const [active, setActive] = useState(0);
  // null until mounted: autoplay is decided on the client from user preference.
  const [playing, setPlaying] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((index: number) => setActive((index + count) % count), [count]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Respect the preference at mount; the user can still start playback.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read a browser-only preference once
    setPlaying(!query.matches);
  }, []);

  const running = playing === true && !hovered && count > 1;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => go(active + 1), INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [running, active, go]);

  const pagerRef = useRef<HTMLDivElement>(null);

  /** Arrow keys move between slide pickers, keeping focus on the current one. */
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = (active + (event.key === "ArrowRight" ? 1 : -1) + count) % count;
    go(next);
    pagerRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") return;
    pointerStart.current = event.clientX;
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (start === null) return;
    const delta = event.clientX - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    go(delta < 0 ? active + 1 : active - 1);
  }

  return (
    <section
      className={`${styles.hero} on-dark`}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Keyboard focus inside the carousel stops rotation until the visitor presses Play (APG).
      onFocus={(event) => {
        if (playing && event.target instanceof HTMLElement && event.target.matches(":focus-visible")) setPlaying(false);
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (pointerStart.current = null)}
    >
      <div className={styles.rules} aria-hidden="true" />

      <div className={`container ${styles.masthead}`}>
        <h1 className={styles.title}>
          {title}
          <span className={styles.tagline}> — {tagline}</span>
        </h1>
      </div>

      <div className={`container ${styles.stage}`} aria-live={running ? "off" : "polite"}>
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <div
              key={slide.id}
              id={`slide-${slide.id}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}: ${slide.eyebrow}`}
              className={styles.slide}
              data-active={isActive || undefined}
              inert={!isActive}
            >
              <div className={styles.primary}>
                <p className={styles.eyebrow}>
                  <span className={styles.rule} aria-hidden="true" />
                  {slide.eyebrow}
                </p>
                <h2 className={styles.heading}>{slide.heading}</h2>
              </div>
              <div className={styles.secondary}>
                <p className={styles.body}>{slide.body}</p>
                <Link href={slide.cta.href} className={styles.cta}>
                  {slide.cta.label}
                  <span aria-hidden="true">→</span>
                </Link>
                <Provenance kind={slide.provenance} note={slide.note} />
              </div>
            </div>
          );
        })}
      </div>

      <div className={`container ${styles.controls}`}>
        <div className={styles.toggleSlot}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setPlaying((value) => !value)}
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            disabled={playing === null}
          >
            <span aria-hidden="true" className={playing ? styles.pauseIcon : styles.playIcon} />
          </button>
        </div>
        <p className={styles.counter} aria-hidden="true">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <span className={styles.counterTotal}> / {String(count).padStart(2, "0")}</span>
        </p>

        <div ref={pagerRef} className={styles.pager} role="group" aria-label="Choose slide" onKeyDown={onKeyDown}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={styles.dot}
              aria-label={`Slide ${index + 1}: ${slide.eyebrow}`}
              aria-current={index === active ? "true" : undefined}
              aria-controls={`slide-${slide.id}`}
              onClick={() => go(index)}
            >
              <span className={styles.dotTrack}>
                <span
                  className={styles.dotFill}
                  data-state={index === active ? (running ? "running" : "static") : "idle"}
                  style={{ animationDuration: `${INTERVAL_MS}ms` }}
                  key={index === active ? `${active}-${running}` : "idle"}
                />
              </span>
            </button>
          ))}
        </div>

        <div className={styles.buttons}>
          <button type="button" className={styles.iconButton} onClick={() => go(active - 1)} aria-label="Previous slide">
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" className={styles.iconButton} onClick={() => go(active + 1)} aria-label="Next slide">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
