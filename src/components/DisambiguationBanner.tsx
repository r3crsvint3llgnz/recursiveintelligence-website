export default function DisambiguationBanner() {
  return (
    <div className="w-full border-b border-yellow-900/20 bg-yellow-900/30 py-2 px-4">
      <p className="text-center text-sm text-yellow-50">
        Practical AI Methodology Meets Cognitive Science
        <span className="mx-2 opacity-30">|</span>
        <strong>Looking for Ricursive (the AI chip design company)?</strong>{" "}
        You want{" "}
        <a
          href="https://ricursive.com"
          target="_blank"
          rel="noopener noreferrer"
          className="ri-link font-semibold"
        >
          ricursive.com
        </a>
      </p>
    </div>
  );
}
