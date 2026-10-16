import type { PortfolioEntity } from "@/content/types";
import { LinkButton } from "./LinkButton";
import { Provenance } from "./Provenance";
import styles from "./EntityCard.module.css";

const ownershipLabel: Record<PortfolioEntity["ownership"], string> = {
  owned: "Owned operating company",
  majority_owned: "Majority-owned",
  minority_stake: "Minority stake",
  pending_confirmation: "Relationship pending confirmation",
};

export function EntityCard({ entity }: { entity: PortfolioEntity }) {
  return (
    <article id={entity.id} className={styles.card} aria-labelledby={`${entity.id}-name`}>
      <div className={styles.header}>
        <p className="eyebrow">{entity.sector}</p>
        <h3 id={`${entity.id}-name`} className={styles.name}>
          {entity.name}
        </h3>
      </div>
      <p className={styles.description}>{entity.description}</p>
      <dl className={styles.facts}>
        <div>
          <dt>Relationship</dt>
          <dd>{entity.relationship}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{ownershipLabel[entity.ownership]}</dd>
        </div>
        <div>
          <dt>Enquiries</dt>
          <dd>
            <a href={`mailto:${entity.enquiry.email}`}>{entity.enquiry.email}</a>
          </dd>
        </div>
        {entity.website ? (
          <div>
            <dt>Website</dt>
            <dd>
              <a href={entity.website} rel="noopener" target="_blank">
                {entity.website.replace(/^https?:\/\//, "")}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
      <LinkButton href={entity.enquiry.href} variant="secondary">
        {entity.enquiry.label}
      </LinkButton>
      <Provenance kind={entity.provenance} note={entity.note} />
    </article>
  );
}
