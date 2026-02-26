/** @type {import('./siteMetadata').SiteMetadata} */
const siteMetadata = {
  title: 'Seth Robins | Industrial AI & Systems Architect',
  author: 'Seth Robins',
  headerTitle: 'Recursive Intelligence',
  description:
    'Connecting practical AI and ML methodologies to the latest research. Combating cognitive atrophy and AI misuse with scientific skepticism and rigor.',
  language: 'en-us',
  theme: 'dark',
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL || 'https://recursiveintelligence.io',
  gardenUrl: 'https://recursiveintelligence.xyz',
  siteLogo: null,
  socialBanner: null,
  bluesky: 'https://bsky.app/profile/r3crsvint3llgnz.bsky.social',
  email: '',
  github: 'https://github.com/r3crsvint3llgnz',
  substack: 'https://substack.recursiveintelligence.io',
  buymeacoffee: 'https://buymeacoffee.com/sethrobinsw',
  locale: 'en-US',
  // Analytics - configure in Module 6
  analytics: {
    // cloudwatchRum: {
    //   applicationId: process.env.NEXT_PUBLIC_AWS_RUM_APPLICATION_ID,
    //   identityPoolId: process.env.NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID,
    //   region: process.env.NEXT_PUBLIC_AWS_RUM_REGION || 'us-east-1',
    // },
  },
  // Comments - configure when needed
  comments: null,
  // Search - configure in Module 2
  search: null,
}

module.exports = siteMetadata
