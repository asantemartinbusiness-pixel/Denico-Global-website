import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { Provenance } from "@/components/Provenance";
import { administrativeHours, contactChannels } from "@/content/site";
import type { EnquiryType } from "@/lib/enquiry/schema";
import { pageMetadata } from "@/lib/seo";
import styles from "./contact.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact Denico Global for group and business enquiries, press and media requests, or Denico Studios enquiries.",
  path: "/contact/",
});

const fallbackEmails = Object.fromEntries(contactChannels.map((c) => [c.id, c.email])) as Record<EnquiryType, string>;

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        lede="For group and business enquiries, media requests or Denico Studios enquiries, use the form below or contact the relevant team directly."
        provenance="reconstructed"
      />

      <div className={`container ${styles.layout}`}>
        <section className={styles.formColumn} aria-labelledby="form-heading">
          <h2 id="form-heading" className={styles.heading}>
            Web enquiry
          </h2>
          <noscript>
            <p className={styles.noscript}>
              The online form needs JavaScript, which is turned off in your browser. Please email the
              relevant address listed on this page instead.
            </p>
          </noscript>
          <ContactForm fallbackEmails={fallbackEmails} />
        </section>

        <aside className={styles.directory} aria-labelledby="directory-heading">
          <h2 id="directory-heading" className="visually-hidden">
            Contact directory
          </h2>
          {contactChannels.map((channel) => (
            <section key={channel.id} id={channel.id} className={styles.channel} aria-labelledby={`${channel.id}-heading`}>
              <h3 id={`${channel.id}-heading`} className={styles.channelHeading}>
                {channel.heading}
              </h3>
              <p className={styles.channelBody}>{channel.description}</p>
              <a className={styles.email} href={`mailto:${channel.email}`}>
                {channel.email}
              </a>
              <Provenance kind={channel.provenance} note={channel.note} />
            </section>
          ))}
          <section className={styles.channel} aria-labelledby="hours-heading">
            <h3 id="hours-heading" className={styles.channelHeading}>
              Administrative hours
            </h3>
            <p className={styles.channelBody}>
              {administrativeHours.days}, {administrativeHours.time}
              {administrativeHours.timezone ? ` (${administrativeHours.timezone})` : ""}.
              <br />
              {administrativeHours.qualifier}.
            </p>
            <Provenance kind="observed" note="Time zone not stated on the source page (OD-05)." />
          </section>
        </aside>
      </div>
    </>
  );
}
