import { describe, it, expect } from 'vitest'
import { genPageMetadata } from './seo'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const siteMetadata = require('../../data/siteMetadata')

describe('genPageMetadata', () => {
  it('includes description at the top level of returned Metadata', () => {
    const meta = genPageMetadata({
      title: 'About',
      description: 'Test description.',
    })
    expect(meta.description).toBe('Test description.')
  })

  it('falls back to siteMetadata.description when no description is provided', () => {
    const meta = genPageMetadata({ title: 'About' })
    expect(meta.description).toBe(siteMetadata.description)
  })

  it('also puts description in openGraph', () => {
    const meta = genPageMetadata({
      title: 'About',
      description: 'OG test.',
    })
    expect(meta.openGraph?.description).toBe('OG test.')
  })
})
