#!/usr/bin/env node
/**
 * query-chat-logs.mjs — CLI tool to query the chat_logs DynamoDB table.
 *
 * Usage:
 *   node query-chat-logs.mjs                    # list recent sessions (last 20)
 *   node query-chat-logs.mjs --session <id>     # dump full conversation for a session
 *   node query-chat-logs.mjs --export           # export all sessions as JSON to stdout
 *   node query-chat-logs.mjs --summary          # print question frequency summary
 *
 * Requires: AWS credentials via seth-dev profile (local only, not deployed).
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { fromIni } from "@aws-sdk/credential-provider-ini";

const TABLE_NAME = "chat_logs";
const REGION = "us-east-1";
const PROFILE = "seth-dev";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: REGION,
    credentials: fromIni({ profile: PROFILE }),
  })
);

async function scanAll() {
  const items = [];
  let lastKey;
  do {
    const res = await client.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        ExclusiveStartKey: lastKey,
      })
    );
    items.push(...(res.Items ?? []));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

async function querySession(sessionId) {
  const res = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "session_id = :sid",
      ExpressionAttributeValues: { ":sid": sessionId },
      ScanIndexForward: true,
    })
  );
  return res.Items ?? [];
}

function groupBySessions(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.session_id;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  // Sort turns within each session
  for (const turns of map.values()) {
    turns.sort((a, b) => a.turn_num - b.turn_num);
  }
  return map;
}

function lastTs(turns) {
  return turns.reduce(
    (max, t) => (t.ts > max ? t.ts : max),
    turns[0]?.ts ?? ""
  );
}

async function listSessions() {
  const items = await scanAll();
  if (items.length === 0) {
    console.log("No sessions found.");
    return;
  }
  const sessions = groupBySessions(items);
  const sorted = [...sessions.entries()].sort(
    (a, b) => lastTs(b[1]).localeCompare(lastTs(a[1]))
  );
  const recent = sorted.slice(0, 20);
  console.log(`\nRecent sessions (${recent.length} of ${sessions.size} total)\n`);
  console.log(
    "SESSION ID                           TURNS  LAST ACTIVITY"
  );
  console.log("-".repeat(72));
  for (const [id, turns] of recent) {
    const ts = lastTs(turns).slice(0, 19).replace("T", " ");
    console.log(`${id}  ${String(turns.length).padStart(5)}  ${ts}`);
  }
}

async function dumpSession(sessionId) {
  const turns = await querySession(sessionId);
  if (turns.length === 0) {
    console.log(`No turns found for session: ${sessionId}`);
    return;
  }
  console.log(`\nSession: ${sessionId}  (${turns.length} turns)\n`);
  for (const t of turns) {
    const ts = (t.ts ?? "").slice(0, 19).replace("T", " ");
    console.log(`[Turn ${t.turn_num}] ${ts}`);
    console.log(`  USER: ${t.user_msg}`);
    console.log(`   BOT: ${t.bot_msg}`);
    console.log();
  }
}

async function exportAll() {
  const items = await scanAll();
  const sessions = groupBySessions(items);
  const output = [];
  for (const [id, turns] of sessions.entries()) {
    output.push({ session_id: id, turns });
  }
  output.sort((a, b) => lastTs(b.turns).localeCompare(lastTs(a.turns)));
  console.log(JSON.stringify(output, null, 2));
}

async function summary() {
  const items = await scanAll();
  if (items.length === 0) {
    console.log("No data.");
    return;
  }
  const userMessages = items.map((i) => i.user_msg ?? "").filter(Boolean);
  const freq = new Map();
  for (const msg of userMessages) {
    // Normalize: lowercase, strip punctuation, trim
    const key = msg.toLowerCase().replace(/[^\w\s]/g, "").trim();
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  const sessions = groupBySessions(items);

  console.log(`\nChat Log Summary`);
  console.log(`  Total sessions : ${sessions.size}`);
  console.log(`  Total turns    : ${items.length}`);
  console.log(`  Avg turns/sess : ${(items.length / sessions.size).toFixed(1)}`);
  console.log(`\nTop 25 questions by frequency:\n`);
  for (const [msg, count] of sorted.slice(0, 25)) {
    console.log(`  ${String(count).padStart(3)}x  ${msg.slice(0, 80)}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--session")) {
    const idx = args.indexOf("--session");
    const id = args[idx + 1];
    if (!id) {
      console.error("Usage: node query-chat-logs.mjs --session <session-id>");
      process.exit(1);
    }
    await dumpSession(id);
  } else if (args.includes("--export")) {
    await exportAll();
  } else if (args.includes("--summary")) {
    await summary();
  } else {
    await listSessions();
  }
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
