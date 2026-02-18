import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { Brief } from '@/types/brief'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.BRIEFS_TABLE_NAME ?? 'briefs'

export async function getBriefs(): Promise<Brief[]> {
  const response = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }))
  const items = (response.Items ?? []) as Brief[]
  return items.sort((a, b) => b.date.localeCompare(a.date))
}

export async function getBrief(id: string): Promise<Brief | null> {
  const response = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  )
  return (response.Item as Brief) ?? null
}
