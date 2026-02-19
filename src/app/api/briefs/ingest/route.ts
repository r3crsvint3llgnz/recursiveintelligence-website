import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual, createHmac, randomBytes } from 'crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  TransactWriteCommand,
  type TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { isSafeUrl } from '@/lib/isSafeUrl'
import type { Brief, BriefItem } from '@/types/brief'

function normalizeItems(items: Array<Record<string, unknown> | BriefItem>): string {
  return JSON.stringify(
    items.map((item) => ({
      title:   (item as Record<string, unknown>).title,
      url:     (item as Record<string, unknown>).url,
      source:  (item as Record<string, unknown>).source,
      snippet: (item as Record<string, unknown>).snippet,
    }))
  )
}

const client = new DynamoDBClient({ region: process.env.APP_REGION ?? 'us-east-1' })
const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = process.env.BRIEFS_TABLE_NAME ?? 'briefs'

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const HMAC_KEY = randomBytes(32)

function validateApiKey(req: NextRequest): boolean {
  const apiKey = process.env.BRIEF_API_KEY
  if (!apiKey) return false
  const authHeader = req.headers.get('authorization') ?? ''
  const match = authHeader.match(/^Bearer (.+)$/)
  if (!match) return false
  const ha = createHmac('sha256', HMAC_KEY).update(match[1]).digest()
  const hb = createHmac('sha256', HMAC_KEY).update(apiKey).digest()
  return timingSafeEqual(ha, hb)
}

interface IngestBody {
  title:    string
  date:     string
  summary:  string
  category: string
  body:     string
  items:    BriefItem[]
}

function validateBody(raw: unknown): { data: IngestBody } | { error: string } {
  if (!raw || typeof raw !== 'object') return { error: 'Body must be a JSON object' }
  const r = raw as Record<string, unknown>

  for (const field of ['title', 'date', 'summary', 'category', 'body']) {
    if (typeof r[field] !== 'string' || !(r[field] as string).trim()) {
      return { error: `Missing or empty field: ${field}` }
    }
  }

  if (isNaN(new Date(r.date as string).getTime())) {
    return { error: 'Field "date" is not a valid ISO 8601 date' }
  }

  if (!Array.isArray(r.items) || r.items.length === 0) {
    return { error: 'Field "items" must be a non-empty array' }
  }

  for (let i = 0; i < (r.items as unknown[]).length; i++) {
    const item = (r.items as Record<string, unknown>[])[i]
    for (const f of ['title', 'url', 'source', 'snippet']) {
      if (typeof item[f] !== 'string' || !(item[f] as string).trim()) {
        return { error: `items[${i}].${f} is missing or empty` }
      }
    }
    if (!isSafeUrl(item.url as string)) {
      return { error: `items[${i}].url failed URL safety check` }
    }
  }

  return {
    data: {
      title:    r.title    as string,
      date:     r.date     as string,
      summary:  r.summary  as string,
      category: r.category as string,
      body:     r.body     as string,
      items: (r.items as Record<string, unknown>[]).map(item => ({
        title:   item.title   as string,
        url:     item.url     as string,
        source:  item.source  as string,
        snippet: item.snippet as string,
      })),
    },
  }
}

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const validated = validateBody(raw)
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const { data } = validated
  const id = `${data.date.slice(0, 10)}-${slugify(data.category)}`

  // O(1) lookup — no scan
  const pointerResult = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id: '__latest__' } })
  )
  const previousId = (pointerResult.Item as { current_id?: string } | undefined)?.current_id

  // Collision check: if id already exists with different content, return 409
  const existingResult = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  )
  if (existingResult.Item) {
    const existing = existingResult.Item
    // Same content (idempotent re-ingest) → treat as success, skip transaction
    if (
      existing.title    === data.title &&
      existing.date     === data.date &&
      existing.summary  === data.summary &&
      existing.category === data.category &&
      existing.body     === data.body &&
      normalizeItems(existing.items as Record<string, unknown>[] ?? []) === normalizeItems(data.items)
    ) {
      return NextResponse.json({ id }, { status: 200 })
    }
    // Different content → conflict
    return NextResponse.json(
      { error: `Brief with id "${id}" already exists with different content` },
      { status: 409 }
    )
  }

  const newBrief: Brief = {
    id,
    entity_type: 'brief',
    title:       data.title,
    date:        data.date,
    summary:     data.summary,
    category:    data.category,
    body:        data.body,
    items:       data.items,
    is_latest:   true,
  }

  // Build transaction: always update pointer + put new brief.
  // Only flip previous record's is_latest if previousId exists and differs from new id.
  // On first deploy, previousId is undefined — 2-op transaction.
  type TransactItem = NonNullable<TransactWriteCommandInput['TransactItems']>[0]

  const transactItems: TransactItem[] = [
    {
      Update: {
        TableName:                 TABLE_NAME,
        Key:                       { id: '__latest__' },
        UpdateExpression:          'SET current_id = :cid, entity_type = :et',
        ExpressionAttributeValues: { ':cid': id, ':et': 'brief' },
      },
    },
    {
      Put: { TableName: TABLE_NAME, Item: newBrief },
    },
  ]

  if (previousId && previousId !== id) {
    transactItems.push({
      Update: {
        TableName:                 TABLE_NAME,
        Key:                       { id: previousId },
        UpdateExpression:          'SET is_latest = :f',
        ExpressionAttributeValues: { ':f': false },
      },
    })
  }

  try {
    await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }))
  } catch (err) {
    console.error('Ingest transaction failed:', err)
    return NextResponse.json({ error: 'Failed to save brief' }, { status: 500 })
  }

  return NextResponse.json({ id }, { status: 201 })
}
