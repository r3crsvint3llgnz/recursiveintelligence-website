import { getIdentity } from "../../lib/identity";
import PortfolioHero from "../../components/portfolio/PortfolioHero";
import KPIGrid from "../../components/portfolio/KPIGrid";
import CaseStudySpotlight from "../../components/portfolio/CaseStudySpotlight";
import ExperienceTimeline from "../../components/portfolio/ExperienceTimeline";
import CompetencyMatrix from "../../components/portfolio/CompetencyMatrix";
import EducationSection from "../../components/portfolio/EducationSection";
import SystemHealthWidget from "../../components/portfolio/SystemHealthWidget";
import ChatWidget from "../../components/portfolio/ChatWidget";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seth Robins — Industrial AI Architect | Resume",
  description:
    "Industrial AI Architect specializing in manufacturing optimization, intelligent operations, and constraint-aware system design. Proven €4M EBITDA impact.",
};

export const dynamic = "force-static";
export const revalidate = false;

export default function ResumePage() {
  const identity = getIdentity();

  return (
    <div className="industrial min-h-screen">
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
