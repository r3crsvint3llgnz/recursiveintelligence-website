import type { Metadata } from 'next'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const siteMetadata = require('../../data/siteMetadata')

interface PageSEOProps {
  title: string
  description?: string
  image?: string
  canonical?: string
  // Allow any additional metadata fields
  [key: string]: unknown
}

export function genPageMetadata({
  title,
  description,
  image,
  canonical,
  ...rest
}: PageSEOProps): Metadata {
  const imageArray = image
    ? [image]
    : (siteMetadata.socialBanner ? [siteMetadata.socialBanner] : [])

  const resolvedDescription = description || siteMetadata.description

  return {
    title,
    description: resolvedDescription,
    openGraph: {
      title: `${title} | ${siteMetadata.title}`,
      description: resolvedDescription,
      siteName: siteMetadata.title,
      images: imageArray,
      locale: siteMetadata.locale,
      type: 'website',
    },
    twitter: {
      title: `${title} | ${siteMetadata.title}`,
      card: 'summary_large_image',
      images: imageArray,
    },
    ...(canonical ? { alternates: { canonical } } : {}),
    ...rest,
  }
}
