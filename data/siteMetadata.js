/** @type {import('./siteMetadata').SiteMetadata} */
const siteMetadata = {
  title: 'Recursive Intelligence | Applied AI Methodology & Cognitive Science',
  author: 'Seth Robins',
  headerTitle: 'Recursive Intelligence',
  description:
    'Practical AI methodology meets cognitive science. Turning peer-reviewed research into frameworks for human-AI collaboration that enhance thinking rather than replace it. Tools and weekly implementation guides.',
  language: 'en-us',
  theme: 'dark',
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL || 'https://recursiveintelligence.io',
  gardenUrl: 'https://recursiveintelligence.xyz',
  siteLogo: null,
  socialBanner: null,
  mastodon: 'https://hachyderm.io/@r3crsvint3llgnz',
  email: '',
  github: 'https://github.com/r3crsvint3llgnz',
  substack: 'https://substack.com/@r3crsvint3llgnz',
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
