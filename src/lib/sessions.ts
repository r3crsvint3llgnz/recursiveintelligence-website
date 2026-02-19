import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' })
const docClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.BRIEF_SESSIONS_TABLE_NAME ?? 'brief_sessions'
const GSI_NAME = 'stripe_customer_id-index'
const SESSION_TTL_SECONDS = 2592000 // 30 days

export interface SessionRecord {
  session_id:             string
  stripe_customer_id:     string
  stripe_subscription_id: string
  email:                  string
  status:                 'active' | 'cancelled' | 'past_due'
  created_at:             string
  updated_at:             string
  ttl:                    number
}

export async function createSession(
  data: Omit<SessionRecord, 'created_at' | 'updated_at' | 'ttl'>
): Promise<void> {
  const now = new Date().toISOString()
  const ttl = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  await docClient.send(
    new PutCommand({ TableName: TABLE_NAME, Item: { ...data, created_at: now, updated_at: now, ttl } })
  )
}

export async function getActiveSession(sessionId: string): Promise<boolean> {
  const result = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { session_id: sessionId } })
  )
  return result.Item?.status === 'active'
}

export async function getSessionRecord(sessionId: string): Promise<SessionRecord | null> {
  const result = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { session_id: sessionId } })
  )
  return result.Item ? (result.Item as SessionRecord) : null
}

export async function getSessionByCustomerId(
  stripeCustomerId: string
): Promise<SessionRecord | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: 'stripe_customer_id = :cid',
      ExpressionAttributeValues: { ':cid': stripeCustomerId },
      Limit: 1,
    })
  )
  return result.Items?.[0] ? (result.Items[0] as SessionRecord) : null
}

export async function updateSessionStatus(
  stripeCustomerId: string,
  status: SessionRecord['status']
): Promise<void> {
  const session = await getSessionByCustomerId(stripeCustomerId)
  if (!session) return
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { session_id: session.session_id },
      UpdateExpression: 'SET #s = :s, updated_at = :u',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':s': status, ':u': new Date().toISOString() },
    })
  )
}
