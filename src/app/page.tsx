/*
  Homepage is intentionally static for MVP. Do not reintroduce Notion fetching here.
*/
import HomeHero from "../components/HomeHero";

export default function Page() {
  return (
    <main>
      <HomeHero />
    </main>
  );
}
