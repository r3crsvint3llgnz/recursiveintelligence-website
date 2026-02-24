import { getIdentity } from "../../lib/identity";
import PortfolioHero from "../../components/portfolio/PortfolioHero";
import KPIGrid from "../../components/portfolio/KPIGrid";
import CaseStudySpotlight from "../../components/portfolio/CaseStudySpotlight";
import ExperienceTimeline from "../../components/portfolio/ExperienceTimeline";
import CompetencyMatrix from "../../components/portfolio/CompetencyMatrix";
import EducationSection from "../../components/portfolio/EducationSection";
import SystemHealthWidget from "../../components/portfolio/SystemHealthWidget";
import ChatWidget from "../../components/portfolio/ChatWidget";
import { genPageMetadata } from '../seo';

export const metadata = genPageMetadata({
  title: 'Seth Robins — Industrial AI Architect',
  description:
    'Industrial AI Architect specializing in manufacturing optimization and intelligent operations. Significant EBITDA impact delivered across global industrial sites.',
});

export const dynamic = "force-static";
export const revalidate = false;

export default function ResumePage() {
  const identity = getIdentity();

  return (
    <div className="industrial min-h-screen">
      {/* Person structured data — safe: JSON.stringify of static identity.yaml, not user input */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: identity.basics.name,
            jobTitle: "Industrial AI Architect",
            description: identity.basics.summary,
            url: identity.basics.links.resume,
            email: identity.basics.email,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Pasadena",
              addressRegion: "TX",
              addressCountry: "US",
            },
            sameAs: [
              identity.basics.links.linkedin,
              identity.basics.links.github,
              identity.basics.links.substack,
              identity.basics.links.website,
            ],
            worksFor: {
              "@type": "Organization",
              name: "Covestro",
            },
            alumniOf: identity.education.map((e) => ({
              "@type": "EducationalOrganization",
              name: e.school,
            })),
            knowsAbout: [
              "Industrial AI",
              "Manufacturing Optimization",
              "Advanced Process Control",
              "DCS Control",
              "IT/OT Integration",
              "AWS Bedrock",
              "LLM Orchestration",
              "Multi-Agent Systems",
              "Cognitive Science",
            ],
          }),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <PortfolioHero data={identity} />

        <div className="space-y-10 mt-10">
          <KPIGrid kpi={identity.key_performance_indicators} />
          <CaseStudySpotlight study={identity.case_study_workshop} />
          <ExperienceTimeline
            experience={identity.experience}
            independent={identity.independent_leadership}
          />
          <CompetencyMatrix competencies={identity.core_competencies} />
          <EducationSection education={identity.education} />
        </div>

        <SystemHealthWidget />
      </div>

      <ChatWidget />
    </div>
  );
}
