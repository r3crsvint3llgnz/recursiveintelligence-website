import fs from "fs";
import path from "path";
import yaml from "js-yaml";

/* ── Type definitions matching idenity.yaml ── */

export interface Experience {
  company: string;
  role: string;
  period: string;
  highlights: string[];
}

export interface IndependentLeadership {
  organization: string;
  role: string;
  highlights: string[];
}

export interface Education {
  school: string;
  degree: string;
}

export interface CaseStudyWorkshop {
  title: string;
  methodology: string;
  team_role: string;
  impact: string;
}

export interface KPIItem {
  metric: string;
  label: string;
  description: string;
}

export interface CoreCompetencies {
  industrial_stack: string[];
  systems_architecture: string[];
  data_governance: string[];
  ai_tools: string[];
}

export interface Identity {
  basics: {
    name: string;
    label: string;
    email: string;
    url: string;
    location: string;
    summary: string;
    links: {
      website: string;
      resume: string;
      garden: string;
      github: string;
      substack: string;
      linkedin: string;
    };
  };
  key_performance_indicators: KPIItem[];
  case_study_workshop: CaseStudyWorkshop;
  experience: Experience[];
  independent_leadership: IndependentLeadership[];
  core_competencies: CoreCompetencies;
  education: Education[];
}

function readAndClean(): string {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "idenity.yaml"),
    "utf-8"
  );
  return raw
    .replace(/\[cite_start\]/g, "")
    .replace(/\s*\[cite:\s*[\d,\s]+\]/g, "");
}

/**
 * Read and parse idenity.yaml at build time.
 * Strips [cite_start] and [cite: …] markers that the source YAML contains.
 */
export function getIdentity(): Identity {
  const cleaned = readAndClean();
  const parsed = yaml.load(cleaned);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("idenity.yaml did not parse to a valid object");
  }
  return parsed as Identity;
}

/**
 * Returns the raw cleaned YAML string — used by the chat system prompt.
 */
export function getRawIdentity(): string {
  return readAndClean();
}
