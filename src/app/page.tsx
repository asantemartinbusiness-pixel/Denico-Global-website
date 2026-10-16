import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { HeroSlider } from "@/components/HeroSlider";
import { Pathways } from "@/components/Pathways";
import { TextBlock } from "@/components/TextBlock";
import { homeIntro, homePrinciples, homeSlides, pathways } from "@/content/pages";
import { site } from "@/content/site";
import { organizationJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ description: site.description, path: "/" });

export default function HomePage() {
  return (
    <>
      <HeroSlider
        slides={homeSlides}
        label="Denico Global introduction"
        title="Denico Global"
        tagline="a long-term holding company"
      />
      <TextBlock section={homeIntro} index={1} />
      <TextBlock section={homePrinciples} index={2} />
      <Pathways
        heading="Explore Denico Global"
        items={[pathways.story, pathways.inside, pathways.portfolio, pathways.contact]}
      />
      <CtaBand
        heading="Group and business enquiries"
        body="Contact Denico Global about the group, its businesses, media requests or Denico Studios."
        action={{ label: "Contact us", href: "/contact/" }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
    </>
  );
}
