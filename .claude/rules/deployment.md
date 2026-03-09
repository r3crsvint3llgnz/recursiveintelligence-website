# Deployment & Infrastructure Rules

## Amplify App
- **App ID:** `d2dmx5f9lbvzyb` | **Region:** `us-east-2` | **Branch:** `main`
- Build: `npm ci` (strict) → `npm run build` | Artifacts: `.next/`
- `NODE_VERSION=20` → npm 10.x. Lock file must match exactly.

## CRITICAL: SSR env vars must be embedded at build time
Amplify does NOT inject non-`NEXT_PUBLIC_` vars into the SSR Lambda runtime.
Every server-side var must be in BOTH the Amplify console AND `next.config.ts → env`:
```typescript
env: {
  MY_VAR: process.env.MY_VAR ?? '',
}
```
Next.js replaces these with literal values at compile time. Workflow: (1) add to Amplify console, (2) add to `next.config.ts env`, (3) push.

## CRITICAL: Amplify env var levels
Two levels exist — branch-level OVERRIDES app-level. Most prod vars live at **branch level**:
```bash
# Check branch-level first
aws amplify get-branch --app-id d2dmx5f9lbvzyb --branch-name main \
  --query 'branch.environmentVariables' --region us-east-2 --profile seth-dev

# Update branch-level
aws amplify update-branch --app-id d2dmx5f9lbvzyb --branch-name main \
  --environment-variables Key=VAR,Value=val --region us-east-2 --profile seth-dev
```
Amplify **blocks** env vars prefixed with `AWS_` or `AMPLIFY_` — use `APP_REGION` not `AWS_REGION`.

## CRITICAL: DynamoDB access from Amplify SSR Lambda
The SSR Lambda runs in Amplify's managed account — customer IAM roles have no effect.
IAM user `amplify-briefs-writer` holds credentials embedded at build time via `next.config.ts`.
Pass credentials explicitly: `new DynamoDBClient({ credentials: { accessKeyId, secretAccessKey } })`.
`AmplifySSRLoggingRole` = CloudWatch log writing only, NOT the Lambda execution role.

## npm lock file (recurring issue)
AI agents on Node 22+/npm 11+ silently add lock file fields npm 10 rejects.
Always fix in ONE shell invocation from within the project dir:
```bash
. ~/.nvm/nvm.sh && nvm use v20 && rm -f package-lock.json && npm install --prefer-online && npm ci
```
- `--prefer-online` is required — without it, packages served from local cache omit the `resolved` URL field, which causes Amplify to fail with `ETARGET: No matching version found`
- Do NOT use `npm install --prefix` from parent dir — produces incomplete lock file
- Always verify with `npm ci` before committing — if it passes locally it will pass on Amplify

## Triggering builds
- Prefer `git push` (webhook) — most reliable
- Retry failed build: `aws amplify start-job --app-id d2dmx5f9lbvzyb --branch-name main --job-type RETRY --job-id <N> --region us-east-2 --profile seth-dev`
- Trigger without code change: `git commit --allow-empty -m "chore: trigger rebuild"`
- Intermittent clone failures: Amplify GitHub App token goes stale under rapid retries. Wait 30s, retry once.

## CloudWatch logs (SSR Lambda)
Log group: `/aws/amplify/d2dmx5f9lbvzyb` in `us-east-2`.
```bash
aws logs describe-log-streams --log-group-name /aws/amplify/d2dmx5f9lbvzyb \
  --region us-east-2 --profile seth-dev --order-by LastEventTime --descending \
  --query 'logStreams[0:3].logStreamName'
```

## Benign build warnings (ignore)
- `Unable to write cache: ERR_BAD_REQUEST` — Amplify cache glitch, harmless
- `Failed to set up process.env.secrets` — no secrets at SSM path `/amplify/d2dmx5f9lbvzyb/main/`, expected
