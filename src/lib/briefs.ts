import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { Brief, BriefItem } from '@/types/brief'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.BRIEFS_TABLE_NAME ?? 'briefs'

function normalizeBrief(raw: unknown): Brief | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  if (
    typeof r.id !== 'string' ||
    typeof r.title !== 'string' ||
    typeof r.summary !== 'string' ||
    typeof r.category !== 'string' ||
    typeof r.date !== 'string'
  ) {
    return null
  }

  const parsed = new Date(r.date)
  if (isNaN(parsed.getTime())) return null

  const items: BriefItem[] = Array.isArray(r.items)
    ? (r.items as BriefItem[]).filter(
        (item) => item && typeof item === 'object' && typeof item.label === 'string'
      )
    : []

  return { id: r.id, title: r.title, date: r.date, summary: r.summary, category: r.category, items }
}

export function isTableNotProvisionedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const name = (err as { name?: string }).name ?? ''
  const message = (err as { message?: string }).message ?? ''
  return name === 'ResourceNotFoundException' || message.includes('ResourceNotFoundException')
}

export async function getBriefs(): Promise<Brief[]> {
  const response = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }))
  const items = (response.Items ?? []).map(normalizeBrief).filter((b): b is Brief => b !== null)
  return items.sort((a, b) => b.date.localeCompare(a.date))
}

export async function getBrief(id: string): Promise<Brief | null> {
  const response = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  )
  return normalizeBrief(response.Item) ?? null
}
