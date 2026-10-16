import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { pageMetadata } from "@/lib/seo";
import styles from "./privacy.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Privacy notice (draft)",
  description: "How Denico Global handles information submitted through this website.",
  path: "/privacy/",
  noindex: true,
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy notice"
        lede="How Denico Global handles information you submit through this website."
      />
      <div className={`container ${styles.body}`}>
        <div className={styles.draft} role="note">
          <strong>Draft for legal review.</strong> This notice has not been approved. The data controller’s legal
          name, registered address, applicable law, and retention period must be confirmed before publication.
        </div>

        <h2>What we collect</h2>
        <p>
          When you use the enquiry form, we collect your name, email address, the type of enquiry, and your message.
          We do not ask for any other personal information.
        </p>

        <h2>Why we collect it</h2>
        <p>We use this information only to read and respond to your enquiry and to keep a record of correspondence.</p>

        <h2>Cookies and analytics</h2>
        <p>
          This website does not set cookies and does not use analytics, advertising or tracking technologies. If
          that changes, this notice will be updated and consent will be requested where required.
        </p>

        <h2>Abuse prevention</h2>
        <p>
          To protect the form from automated abuse, our server briefly processes the network address of each
          submission to limit how often enquiries can be sent. It is not stored with your enquiry.
        </p>

        <h2>Retention</h2>
        <p>[To be confirmed: retention period for enquiry correspondence.]</p>

        <h2>Your rights and contact</h2>
        <p>
          You may ask about, correct or request deletion of information you have sent us by emailing{" "}
          <a href="mailto:info@denicoglobal.com">info@denicoglobal.com</a>.
        </p>

        <p>
          <Link href="/contact/">Return to Contact</Link>
        </p>
      </div>
    </>
  );
}
