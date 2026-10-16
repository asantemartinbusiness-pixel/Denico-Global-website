import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { EntityCard } from "@/components/EntityCard";
import { PageHero } from "@/components/PageHero";
import { Provenance } from "@/components/Provenance";
import { portfolioEntities, portfolioLede, studiosClarification } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import styles from "./portfolio.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Group Portfolio Overview",
  description: "The businesses that form the Denico group, and how each relates to Denico Global.",
  // Legacy WordPress slug preserved pending an approved route change (see docs/seo-and-redirects.md).
  path: "/companies-2/",
});

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Group portfolio"
        title="Group Portfolio Overview"
        lede={portfolioLede.text}
        provenance={portfolioLede.provenance}
      />
      <section className={styles.section} aria-labelledby="companies-heading">
        <div className="container">
          <div className={styles.head}>
            <h2 id="companies-heading" className={styles.heading}>
              {portfolioEntities.length === 1 ? "Operating company" : "Operating companies"}
            </h2>
          </div>
          <div className={styles.grid}>
            {portfolioEntities.map((entity) => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
          </div>
          <div className={styles.note}>
            <p>{studiosClarification.text}</p>
            <p>
              Denico Global does not list clients, suppliers, partners or prospective projects as part of the
              group.
            </p>
            <Provenance kind={studiosClarification.provenance} note={studiosClarification.note} />
          </div>
        </div>
      </section>
      <CtaBand
        heading="Enquiries about the group"
        body="For questions about Denico Global or its businesses, contact our team."
        action={{ label: "Business enquiries", href: "/contact/" }}
      />
    </>
  );
}
