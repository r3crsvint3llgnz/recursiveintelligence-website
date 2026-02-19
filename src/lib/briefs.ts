import { cache } from 'react'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { Brief, BriefItem } from '@/types/brief'

const client = new DynamoDBClient({
  region: process.env.APP_REGION ?? 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.BRIEFS_TABLE_NAME ?? 'briefs'
const GSI_NAME = 'entity_type-date-index'

function normalizeBriefItem(raw: unknown): BriefItem | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (
    typeof r.title !== 'string' ||
    typeof r.url !== 'string' ||
    typeof r.source !== 'string' ||
    typeof r.snippet !== 'string'
  ) return null
  return { title: r.title, url: r.url, source: r.source, snippet: r.snippet }
}

function normalizeBrief(raw: unknown): Brief | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (
    typeof r.id !== 'string' ||
    typeof r.title !== 'string' ||
    typeof r.summary !== 'string' ||
    typeof r.category !== 'string' ||
    typeof r.date !== 'string' ||
    typeof r.body !== 'string'
  ) return null
  const parsed = new Date(r.date as string)
  if (isNaN(parsed.getTime())) return null
  const items: BriefItem[] = Array.isArray(r.items)
    ? (r.items as unknown[]).map(normalizeBriefItem).filter((i): i is BriefItem => i !== null)
    : []
  return {
    id: r.id,
    entity_type: typeof r.entity_type === 'string' ? r.entity_type : 'brief',
    title: r.title,
    date: r.date,
    summary: r.summary,
    category: r.category,
    body: r.body,
    items,
    is_latest: r.is_latest === true,
  }
}

export function isTableNotProvisionedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const name = (err as { name?: string }).name ?? ''
  const message = (err as { message?: string }).message ?? ''
  return name === 'ResourceNotFoundException' || message.includes('ResourceNotFoundException')
}

export async function getBriefs(): Promise<Brief[]> {
  // Uses entity_type-date-index GSI for reverse-chronological order without a scan.
  // FilterExpression excludes the __latest__ pointer record (which also has entity_type="brief").
  // Paginate to handle tables growing beyond DynamoDB's 1 MB per-response limit.
  const allItems: Record<string, unknown>[] = []
  let lastKey: Record<string, unknown> | undefined

  do {
    const response = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: 'entity_type = :et',
      FilterExpression: 'id <> :latest',
      ExpressionAttributeValues: {
        ':et': 'brief',
        ':latest': '__latest__',
      },
      ScanIndexForward: false,
      ...(lastKey ? { ExclusiveStartKey: lastKey } : {}),
    }))
    allItems.push(...(response.Items ?? []))
    lastKey = response.LastEvaluatedKey as Record<string, unknown> | undefined
  } while (lastKey)

  return allItems.map(normalizeBrief).filter((b): b is Brief => b !== null)
}

export const getBrief = cache(async (id: string): Promise<Brief | null> => {
  const response = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  )
  return normalizeBrief(response.Item) ?? null
})
