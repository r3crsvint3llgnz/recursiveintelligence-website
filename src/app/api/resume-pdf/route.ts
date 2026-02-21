import { NextResponse } from "next/server";
import React from "react";
import ReactPDF from "@react-pdf/renderer";

// Helvetica built-in fonts only — no external fetches (Lambda has no outbound font access)
const { Document, Page, Text, View, StyleSheet, Link } = ReactPDF;

const EMERALD = "#059669";
const NAVY = "#0f172a";
const SLATE_700 = "#334155";
const SLATE_500 = "#64748b";
const SLATE_200 = "#e2e8f0";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: NAVY,
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    lineHeight: 1.4,
  },
  // Header
  headerName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: NAVY,
    marginBottom: 3,
  },
  headerLabel: {
    fontSize: 10,
    color: EMERALD,
    marginBottom: 4,
  },
  headerMeta: {
    fontSize: 8,
    color: SLATE_500,
    marginBottom: 4,
  },
  headerLink: {
    color: EMERALD,
    textDecoration: "none",
  },
  summary: {
    fontSize: 9,
    color: SLATE_700,
    marginTop: 6,
    lineHeight: 1.5,
  },
  linksRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 4,
  },
  linkItem: {
    fontSize: 7.5,
    color: EMERALD,
    textDecoration: "none",
  },
  linkSeparator: {
    fontSize: 7.5,
    color: SLATE_500,
  },
  accentBar: {
    height: 2,
    backgroundColor: EMERALD,
    marginVertical: 8,
  },
  // Sections
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: EMERALD,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: SLATE_200,
    paddingBottom: 3,
  },
  section: {
    marginBottom: 10,
  },
  // KPI grid
  kpiGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 5,
    marginBottom: 4,
  },
  kpiCard: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderLeftWidth: 2,
    borderLeftColor: EMERALD,
    padding: 6,
    borderRadius: 2,
  },
  kpiCategory: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: EMERALD,
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  kpiMetric: {
    fontFamily: "Helvetica-Bold",
    fontSize: 15,
    color: NAVY,
    marginBottom: 2,
  },
  kpiDescription: {
    fontSize: 7.5,
    color: SLATE_700,
    lineHeight: 1.3,
  },
  // Experience
  jobRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 2,
  },
  jobTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: NAVY,
  },
  jobCompany: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: EMERALD,
  },
  jobPeriod: {
    fontSize: 8,
    color: SLATE_500,
  },
  bulletItem: {
    flexDirection: "row" as const,
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 8,
    color: EMERALD,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    color: SLATE_700,
    lineHeight: 1.4,
  },
  // Competencies
  tagRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 4,
    marginBottom: 6,
  },
  tag: {
    fontSize: 7.5,
    color: EMERALD,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "#a7f3d0",
  },
  compCategory: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: SLATE_700,
    marginBottom: 3,
    marginTop: 4,
  },
  // Education
  eduRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 3,
  },
  eduDegree: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: NAVY,
  },
  eduSchool: {
    fontSize: 8,
    color: SLATE_500,
  },
  // Footer
  footer: {
    position: "absolute" as const,
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center" as const,
    fontSize: 7,
    color: SLATE_500,
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResumePDF({ data }: { data: any }) {
  const { basics, key_performance_indicators: kpi, experience, independent_leadership, core_competencies: comp, education, case_study_workshop: cs } = data;

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "LETTER", style: s.page },

      // Header
      React.createElement(
        View,
        null,
        React.createElement(Text, { style: s.headerName }, basics.name),
        React.createElement(Text, { style: s.headerLabel }, basics.label),
        React.createElement(
          Text,
          { style: s.headerMeta },
          `${basics.location} | `,
          React.createElement(Link, { src: `mailto:${basics.email}`, style: s.headerLink }, basics.email)
        ),
        React.createElement(
          View,
          { style: s.linksRow },
          React.createElement(Link, { src: basics.links.website, style: s.linkItem }, "Website"),
          React.createElement(Text, { style: s.linkSeparator }, " · "),
          React.createElement(Link, { src: basics.links.resume, style: s.linkItem }, "Resume"),
          React.createElement(Text, { style: s.linkSeparator }, " · "),
          React.createElement(Link, { src: basics.links.garden, style: s.linkItem }, "Digital Garden"),
          React.createElement(Text, { style: s.linkSeparator }, " · "),
          React.createElement(Link, { src: basics.links.github, style: s.linkItem }, "GitHub"),
          React.createElement(Text, { style: s.linkSeparator }, " · "),
          React.createElement(Link, { src: basics.links.substack, style: s.linkItem }, "Substack"),
          React.createElement(Text, { style: s.linkSeparator }, " · "),
          React.createElement(Link, { src: basics.links.linkedin, style: s.linkItem }, "LinkedIn")
        ),
        React.createElement(Text, { style: s.summary }, basics.summary)
      ),
      React.createElement(View, { style: s.accentBar }),

      // KPIs
      React.createElement(
        View,
        { style: s.section },
        React.createElement(Text, { style: s.sectionTitle }, "Key Performance Indicators"),
        React.createElement(
          View,
          { style: s.kpiGrid },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...kpi.map((k: any, i: number) =>
            React.createElement(
              View,
              { key: i, style: s.kpiCard },
              React.createElement(Text, { style: s.kpiCategory }, k.label),
              React.createElement(Text, { style: s.kpiMetric }, k.metric),
              React.createElement(Text, { style: s.kpiDescription }, k.description)
            )
          )
        )
      ),

      // Case Study
      React.createElement(
        View,
        { style: s.section },
        React.createElement(Text, { style: s.sectionTitle }, `Case Study: ${cs.title}`),
        React.createElement(
          View,
          { style: s.bulletItem },
          React.createElement(Text, { style: s.bulletDot }, "\u2022"),
          React.createElement(Text, { style: s.bulletText }, `Methodology: ${cs.methodology}`)
        ),
        React.createElement(
          View,
          { style: s.bulletItem },
          React.createElement(Text, { style: s.bulletDot }, "\u2022"),
          React.createElement(Text, { style: s.bulletText }, `Role: ${cs.team_role}`)
        ),
        React.createElement(
          View,
          { style: s.bulletItem },
          React.createElement(Text, { style: s.bulletDot }, "\u2022"),
          React.createElement(Text, { style: s.bulletText }, `Impact: ${cs.impact}`)
        )
      ),

      // Experience
      React.createElement(
        View,
        { style: s.section },
        React.createElement(Text, { style: s.sectionTitle }, "Professional Experience"),
        ...experience.map((job: { role: string; company: string; period: string; highlights: string[] }, i: number) =>
          React.createElement(
            View,
            { key: i, style: { marginBottom: 7 } },
            React.createElement(
              View,
              { style: s.jobRow },
              React.createElement(
                View,
                null,
                React.createElement(Text, { style: s.jobTitle }, job.role),
                React.createElement(Text, { style: s.jobCompany }, job.company)
              ),
              React.createElement(Text, { style: s.jobPeriod }, job.period)
            ),
            ...job.highlights.map((h: string, j: number) =>
              React.createElement(
                View,
                { key: j, style: s.bulletItem },
                React.createElement(Text, { style: s.bulletDot }, "\u2022"),
                React.createElement(Text, { style: s.bulletText }, h)
              )
            )
          )
        )
      ),

      // Independent Leadership
      ...(independent_leadership?.length > 0
        ? [
            React.createElement(
              View,
              { key: "indep", style: s.section },
              React.createElement(Text, { style: s.sectionTitle }, "Independent Leadership"),
              ...independent_leadership.map((org: { organization: string; role: string; highlights: string[] }, i: number) =>
                React.createElement(
                  View,
                  { key: i, style: { marginBottom: 5 } },
                  React.createElement(Text, { style: s.jobTitle }, org.role),
                  React.createElement(Text, { style: s.jobCompany }, org.organization),
                  ...org.highlights.map((h: string, j: number) =>
                    React.createElement(
                      View,
                      { key: j, style: s.bulletItem },
                      React.createElement(Text, { style: s.bulletDot }, "\u2022"),
                      React.createElement(Text, { style: s.bulletText }, h)
                    )
                  )
                )
              )
            ),
          ]
        : []),

      // Competencies
      React.createElement(
        View,
        { style: s.section },
        React.createElement(Text, { style: s.sectionTitle }, "Core Competencies"),
        ...Object.entries(comp).map(([category, items]) =>
          React.createElement(
            View,
            { key: category },
            React.createElement(
              Text,
              { style: s.compCategory },
              category.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
            ),
            React.createElement(
              View,
              { style: s.tagRow },
              ...(items as string[]).map((item: string, i: number) =>
                React.createElement(Text, { key: i, style: s.tag }, item)
              )
            )
          )
        )
      ),

      // Education
      React.createElement(
        View,
        { style: s.section },
        React.createElement(Text, { style: s.sectionTitle }, "Education"),
        ...education.map((ed: { degree: string; school: string }, i: number) =>
          React.createElement(
            View,
            { key: i, style: s.eduRow },
            React.createElement(Text, { style: s.eduDegree }, ed.degree),
            React.createElement(Text, { style: s.eduSchool }, ed.school)
          )
        )
      ),

      // Footer
      React.createElement(
        Text,
        { style: s.footer },
        `${basics.email}  |  ${basics.links.resume}  |  Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}`
      )
    )
  );
}

export async function GET() {
  try {
    const identityModule = await import("../../../lib/identity");
    const data = identityModule.getIdentity();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfStream = await (ReactPDF.renderToStream as any)(
      React.createElement(ResumePDF, { data })
    );

    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Seth_Robins_Resume.pdf"',
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
