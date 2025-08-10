export const EMAIL_TO = "seth.robins@recursiveintelligence.io";
export const emailSubject = "Consultation inquiry — Recursive Intelligence";

// CRLF for Windows/Outlook
const LB = "\r\n";

export const emailTemplate =
  "Hi Seth," + LB + LB +
  "We’re reaching out to explore people-first ways to use AI so our team can focus on the human parts of our work and delight customers." + LB +
  "We’d value your guidance on a minimal, high-impact stack and a clear first step." + LB + LB +
  "Context and goals:" + LB +
  "..." + LB + LB +
  "Current systems and constraints:" + LB +
  "..." + LB + LB +
  "Timeline and decision points:" + LB +
  "..." + LB + LB +
  "Anything else you should know:" + LB +
  "...";

export function buildMailto() {
  const subject = encodeURIComponent(emailSubject);
  const body = encodeURIComponent(emailTemplate).replace(/%0A/g, "%0D%0A");
  return `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
}
