import { describe, it, expect } from 'vitest'
import { slugify } from './route'

function generateId(date: string, category: string): string {
  return `${date.slice(0, 10)}-${slugify(category)}`
}

describe('ID generation', () => {
  it('generates deterministic ID from date and category', () => {
    expect(generateId('2026-02-18T06:00:00Z', 'AI/ML')).toBe('2026-02-18-ai-ml')
  })

  it('handles multi-word categories', () => {
    expect(generateId('2026-02-18T06:00:00Z', 'Large Language Models')).toBe(
      '2026-02-18-large-language-models'
    )
  })

  it('strips leading/trailing hyphens', () => {
    expect(generateId('2026-02-18T06:00:00Z', '  AI  ')).toBe('2026-02-18-ai')
  })
})
