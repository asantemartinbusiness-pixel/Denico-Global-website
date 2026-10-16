import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { Responsibilities } from "@/components/Responsibilities";
import { TextBlock } from "@/components/TextBlock";
import {
  insideLede,
  insidePrinciples,
  insideResponsibilities,
  insideStructure,
  portfolioEntities,
} from "@/content/pages";
import { Provenance } from "@/components/Provenance";
import { pageMetadata } from "@/lib/seo";
import styles from "./inside.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Inside Denico Global",
  description:
    "How Denico Global is organised: group-level oversight, independent operating companies, and the principles that connect them.",
  path: "/inside-denico/",
});

export default function InsideDenicoPage() {
  const studios = portfolioEntities.find((entity) => entity.id === "denico-studios");

  return (
    <>
      <PageHero
        eyebrow="The group"
        title="Inside Denico Global"
        lede={insideLede.text}
        provenance={insideLede.provenance}
      />
      <TextBlock section={insideStructure} index={1} />
      <Responsibilities
        heading="Oversight and independence"
        intro="Group oversight and the independence of each business are designed to work together."
        group={insideResponsibilities.group}
        company={insideResponsibilities.company}
        provenance={insideResponsibilities.provenance}
        note={insideResponsibilities.note}
      />
      {studios ? (
        <section className={styles.studios} aria-labelledby="studios-heading">
          <div className={`container ${styles.studiosGrid}`}>
            <div>
              <p className="eyebrow">Operating company</p>
              <h2 id="studios-heading" className={styles.studiosHeading}>
                {studios.name}
              </h2>
            </div>
            <div className={styles.studiosBody}>
              <p>{studios.description}</p>
              <p>
                <Link href="/companies-2/#denico-studios">View in the group portfolio</Link>
              </p>
              <Provenance kind={studios.provenance} note={studios.note} />
            </div>
          </div>
        </section>
      ) : null}
      <TextBlock section={insidePrinciples} index={2} />
      <CtaBand
        heading="Speak to Denico Global"
        body="For group and business enquiries, contact our team."
        action={{ label: "Business enquiries", href: "/contact/" }}
      />
    </>
  );
}
