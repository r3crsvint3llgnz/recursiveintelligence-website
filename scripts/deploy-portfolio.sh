#!/usr/bin/env bash
set -euo pipefail

# Deploy portfolio to S3 static hosting
# Bucket: sethrobins.recursiveintelligence.io
# Usage: ./scripts/deploy-portfolio.sh [--create-bucket]

BUCKET="sethrobins.recursiveintelligence.io"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

# Create bucket if --create-bucket flag is passed
if [[ "${1:-}" == "--create-bucket" ]]; then
  echo "▸ Creating S3 bucket: $BUCKET"
  if [[ "$REGION" == "us-east-1" ]]; then
    aws s3api create-bucket --bucket "$BUCKET" --region "$REGION"
  else
    aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
      --create-bucket-configuration "LocationConstraint=$REGION"
  fi

  echo "▸ Enabling static website hosting"
  aws s3 website "s3://$BUCKET/" --index-document index.html --error-document 404.html

  echo "▸ Setting public access policy"
  aws s3api put-public-access-block --bucket "$BUCKET" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

  cat <<EOF | aws s3api put-bucket-policy --bucket "$BUCKET" --policy file:///dev/stdin
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::${BUCKET}/*"
  }]
}
EOF
  echo "✓ Bucket created and configured"
fi

# Build
echo "▸ Building Next.js application..."
npm run build

# Sync the build output
echo "▸ Syncing to s3://$BUCKET/"
aws s3 sync .next/server/app/ "s3://$BUCKET/" \
  --exclude "*" \
  --include "resume/*" \
  --delete

# Also sync any static assets needed
aws s3 sync .next/static/ "s3://$BUCKET/_next/static/" --cache-control "public, max-age=31536000, immutable"

echo ""
echo "✓ Deployed to: http://${BUCKET}.s3-website-${REGION}.amazonaws.com"
echo "  (or configure DNS to point ${BUCKET} to the S3 website endpoint)"
