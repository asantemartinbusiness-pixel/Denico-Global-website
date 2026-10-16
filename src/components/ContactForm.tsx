"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent, type MouseEvent } from "react";
import {
  ENQUIRY_TYPE_LABELS,
  ENQUIRY_TYPES,
  enquirySchema,
  fieldErrors as toFieldErrors,
  LIMITS,
  MIN_FILL_TIME_MS,
  type EnquiryFieldErrors,
  type EnquiryType,
} from "@/lib/enquiry/schema";
import type { EnquiryResponseBody } from "@/lib/enquiry/handler";
import styles from "./ContactForm.module.css";

type Values = { name: string; email: string; enquiryType: EnquiryType | ""; message: string };
type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; reference: string; mode: "test" | "live" }
  | { kind: "error"; message: string };

const FIELD_ORDER: (keyof Values)[] = ["name", "email", "enquiryType", "message"];
const FIELD_LABELS: Record<keyof Values, string> = {
  name: "Name",
  email: "Email address",
  enquiryType: "Type of enquiry",
  message: "Message",
};

function newKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

function isEnquiryType(value: string | null): value is EnquiryType {
  return value !== null && (ENQUIRY_TYPES as readonly string[]).includes(value);
}

export function ContactForm({ fallbackEmails }: { fallbackEmails: Record<EnquiryType, string> }) {
  const formId = useId();
  const [values, setValues] = useState<Values>({ name: "", email: "", enquiryType: "", message: "" });
  const [errors, setErrors] = useState<EnquiryFieldErrors>({});
  // The summary reflects the last submit attempt only, so it is not rebuilt on every keystroke.
  const [summary, setSummary] = useState<EnquiryFieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [honeypot, setHoneypot] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const startedAt = useRef(0);
  const idempotencyKey = useRef("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
    idempotencyKey.current = newKey();
    const requested = new URLSearchParams(window.location.search).get("enquiry");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only setup once on mount
    setHydrated(true);
    if (isEnquiryType(requested)) setValues((v) => ({ ...v, enquiryType: requested }));
  }, []);

  useEffect(() => {
    if (status.kind === "success" || status.kind === "error") resultRef.current?.focus();
  }, [status]);

  function validate(next: Values) {
    const result = enquirySchema.safeParse(next);
    return result.success ? {} : toFieldErrors(result.error);
  }

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (attempted) setErrors(validate(next));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setAttempted(true);

    const found = validate(values);
    setErrors(found);
    setSummary(found);
    if (Object.keys(found).length > 0) {
      setStatus({ kind: "idle" });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    submitting.current = true;
    setStatus({ kind: "submitting" });
    try {
      // The server rejects forms completed faster than a person could. Fast but
      // genuine visitors (autofill, paste) wait out the remainder instead.
      const remaining = startedAt.current + MIN_FILL_TIME_MS + 250 - Date.now();
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));

      const response = await fetch("/api/enquiry/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: honeypot,
          startedAt: startedAt.current,
          idempotencyKey: idempotencyKey.current,
        }),
      });
      const body = (await response.json().catch(() => null)) as EnquiryResponseBody | null;

      if (body?.ok) {
        setStatus({ kind: "success", reference: body.reference, mode: body.mode });
        return;
      }
      if (body && body.error === "invalid" && body.fieldErrors) {
        setErrors(body.fieldErrors);
        setSummary(body.fieldErrors);
        setStatus({ kind: "idle" });
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      setStatus({
        kind: "error",
        message: body?.message ?? "Your enquiry could not be sent. Please try again, or email us directly.",
      });
    } catch {
      setStatus({
        kind: "error",
        message: "We could not reach the server. Check your connection and try again, or email us directly.",
      });
    } finally {
      submitting.current = false;
    }
  }

  /** Brings the whole field (label and error, not just the input) below the sticky header. */
  function jumpToField(event: MouseEvent<HTMLAnchorElement>, key: keyof Values) {
    const target = document.getElementById(id(key));
    if (!target) return;
    event.preventDefault();
    const wrapper = target.closest("[data-field]") ?? target;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    wrapper.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    target.focus({ preventScroll: true });
  }

  function reset() {
    // Keep the chosen enquiry type: a follow-up is usually for the same team.
    setValues((v) => ({ name: "", email: "", enquiryType: v.enquiryType, message: "" }));
    setErrors({});
    setSummary({});
    setAttempted(false);
    startedAt.current = Date.now();
    idempotencyKey.current = newKey();
    setStatus({ kind: "idle" });
  }

  const fallbackEmail = fallbackEmails[values.enquiryType || "general"];
  const errorList = FIELD_ORDER.filter((key) => summary[key]);
  const id = (key: string) => `${formId}-${key}`;
  const busy = status.kind === "submitting";

  if (status.kind === "success") {
    return (
      <div ref={resultRef} tabIndex={-1} className={`${styles.notice} ${styles.success}`} role="status">
        <h3 className={styles.noticeHeading}>
          {status.mode === "test" ? "Enquiry recorded in test mode" : "Thank you — your enquiry has been sent"}
        </h3>
        {status.mode === "test" ? (
          <p>
            This is a local test environment. Your enquiry was saved to the local test outbox and has{" "}
            <strong>not</strong> been delivered to Denico Global.
          </p>
        ) : (
          <p>We will respond to the email address you provided.</p>
        )}
        <p>
          Reference: <strong className={styles.reference}>{status.reference}</strong>
        </p>
        <button type="button" className={styles.secondaryButton} onClick={reset}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    // method="post" keeps personal data out of URLs even if a submission
    // somehow bypasses the script; the submit button stays disabled until hydrated.
    <form
      id="enquiry-form"
      className={styles.form}
      method="post"
      action="/api/enquiry/"
      noValidate
      onSubmit={onSubmit}
      aria-describedby={`${formId}-intro`}
    >
      <p id={`${formId}-intro`} className={styles.intro}>
        All fields are required.
      </p>

      {errorList.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          className={`${styles.notice} ${styles.error}`}
          aria-labelledby={`${formId}-summary-heading`}
          role="group"
        >
          <h3 id={`${formId}-summary-heading`} className={styles.noticeHeading}>
            There is a problem with your enquiry
          </h3>
          <ul>
            {errorList.map((key) => (
              <li key={key}>
                <a href={`#${id(key)}`} onClick={(event) => jumpToField(event, key)}>
                  {summary[key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {status.kind === "error" ? (
        <div
          ref={resultRef}
          tabIndex={-1}
          className={`${styles.notice} ${styles.error}`}
          role="group"
          aria-labelledby={`${formId}-failure-heading`}
        >
          <h3 id={`${formId}-failure-heading`} className={styles.noticeHeading}>
            Your enquiry has not been sent
          </h3>
          <p>{status.message}</p>
          <p>
            Email: <a href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>
          </p>
        </div>
      ) : null}

      <div className={styles.field} data-field data-invalid={errors.name ? true : undefined}>
        <label htmlFor={id("name")}>{FIELD_LABELS.name}</label>
        {errors.name ? (
          <p id={`${id("name")}-error`} className={styles.fieldError}>
            <span className="visually-hidden">Error: </span>
            {errors.name}
          </p>
        ) : null}
        <input
          id={id("name")}
          name="name"
          type="text"
          autoComplete="name"
          maxLength={LIMITS.name}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          readOnly={busy}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${id("name")}-error` : undefined}
          required
        />
      </div>

      <div className={styles.field} data-field data-invalid={errors.email ? true : undefined}>
        <label htmlFor={id("email")}>{FIELD_LABELS.email}</label>
        {errors.email ? (
          <p id={`${id("email")}-error`} className={styles.fieldError}>
            <span className="visually-hidden">Error: </span>
            {errors.email}
          </p>
        ) : null}
        <input
          id={id("email")}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          maxLength={LIMITS.email}
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          readOnly={busy}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${id("email")}-error` : undefined}
          required
        />
      </div>

      <fieldset
        data-field
        className={`${styles.field} ${styles.fieldset}`}
        data-invalid={errors.enquiryType ? true : undefined}
        aria-describedby={errors.enquiryType ? `${id("enquiryType")}-error` : undefined}
      >
        <legend>{FIELD_LABELS.enquiryType}</legend>
        {errors.enquiryType ? (
          <p id={`${id("enquiryType")}-error`} className={styles.fieldError}>
            <span className="visually-hidden">Error: </span>
            {errors.enquiryType}
          </p>
        ) : null}
        <div className={styles.options}>
          {ENQUIRY_TYPES.map((type, index) => (
            <label key={type} className={styles.option}>
              <input
                id={index === 0 ? id("enquiryType") : undefined}
                type="radio"
                name="enquiryType"
                value={type}
                checked={values.enquiryType === type}
                onChange={() => update("enquiryType", type)}
                disabled={busy}
                aria-describedby={errors.enquiryType ? `${id("enquiryType")}-error` : undefined}
                required
              />
              <span>{ENQUIRY_TYPE_LABELS[type]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.field} data-field data-invalid={errors.message ? true : undefined}>
        <label htmlFor={id("message")}>{FIELD_LABELS.message}</label>
        {errors.message ? (
          <p id={`${id("message")}-error`} className={styles.fieldError}>
            <span className="visually-hidden">Error: </span>
            {errors.message}
          </p>
        ) : null}
        <textarea
          id={id("message")}
          name="message"
          rows={7}
          maxLength={LIMITS.message}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          readOnly={busy}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={`${id("message")}-count${errors.message ? ` ${id("message")}-error` : ""}`}
          required
        />
        <p id={`${id("message")}-count`} className={styles.hint}>
          {values.message.length} of {LIMITS.message} characters
        </p>
      </div>

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor={id("website")}>Leave this field empty</label>
        <input
          id={id("website")}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <p className={styles.privacy}>
        We use the details you provide only to respond to your enquiry. See our{" "}
        <Link href="/privacy/">privacy notice</Link>.
      </p>

      <button type="submit" className={styles.submit} disabled={busy || !hydrated}>
        {busy ? "Sending…" : "Send enquiry"}
      </button>
      <p className="visually-hidden" role="status" aria-live="polite">
        {busy ? "Sending your enquiry" : ""}
      </p>
    </form>
  );
}
