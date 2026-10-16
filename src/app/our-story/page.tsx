import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Pathways } from "@/components/Pathways";
import { TextBlock } from "@/components/TextBlock";
import { pathways, storyLede, storySections } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our Story",
  description:
    "Denico Global is a long-term holding company combining disciplined capital allocation with active operational oversight. Our approach and our focus.",
  path: "/our-story/",
});

export default function OurStoryPage() {
  return (
    <>
      <PageHero eyebrow="About Denico Global" title="Our Story" lede={storyLede.text} provenance={storyLede.provenance} />
      {storySections.map((section, index) => (
        <TextBlock key={section.id} section={section} index={index + 1} />
      ))}
      <Pathways
        heading="Continue exploring"
        items={[pathways.inside, pathways.portfolio, pathways.contact]}
      />
    </>
  );
}
