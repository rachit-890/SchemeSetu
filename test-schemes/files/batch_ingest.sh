#!/bin/bash
# Batch-creates and ingests 5 new schemes for expanded test coverage.
# Run from the directory containing this script and the scheme .txt files.
# Requires: backend running on localhost:8080, jq installed.

set -e
BASE_URL="http://localhost:8080/api/v1/admin/schemes"
ADMIN_KEY="${ADMIN_API_KEY:-dev-admin-key}"

create_and_ingest() {
  local name="$1"
  local description="$2"
  local category="$3"
  local issuing_body="$4"
  local source_url="$5"
  local text_file="$6"

  echo "=== Creating: $name ==="
  create_response=$(curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -H "X-Admin-Key: $ADMIN_KEY" \
    -d "{\"name\": \"$name\", \"description\": \"$description\", \"category\": \"$category\", \"issuingBody\": \"$issuing_body\", \"sourceUrl\": \"$source_url\", \"status\": \"ACTIVE\"}")

  scheme_id=$(echo "$create_response" | jq -r '.id')

  if [ "$scheme_id" == "null" ] || [ -z "$scheme_id" ]; then
    echo "!!! Failed to create scheme. Response:"
    echo "$create_response" | jq .
    echo ""
    return 1
  fi

  echo "Created scheme id: $scheme_id"

  scheme_text=$(jq -Rs . < "$text_file")

  echo "=== Ingesting text for scheme $scheme_id ==="
  ingest_result=$(curl -s -X POST "$BASE_URL/$scheme_id/ingest" \
    -H "Content-Type: application/json" \
    -H "X-Admin-Key: $ADMIN_KEY" \
    -d "{\"schemeText\": $scheme_text}")

  echo "$ingest_result" | jq .

  echo "=== Auto-approving all PENDING_REVIEW rules for scheme $scheme_id ==="
  rule_ids=$(curl -s -H "X-Admin-Key: $ADMIN_KEY" "$BASE_URL/rules/pending" | jq -r ".[] | select(.schemeId==$scheme_id) | .id")
  for rid in $rule_ids; do
    echo "Approving rule $rid..."
    curl -s -X POST "$BASE_URL/$scheme_id/rules/$rid/approve" -H "X-Admin-Key: $ADMIN_KEY" | jq -c .
  done

  echo "=== Done: $name (scheme id $scheme_id) ==="
  echo ""
}

create_and_ingest \
  "Atal Pension Yojana" \
  "Guaranteed monthly pension scheme for unorganized sector workers after age 60." \
  "PENSION" \
  "Pension Fund Regulatory and Development Authority" \
  "https://www.npscra.nsdl.co.in/scheme-details.php" \
  "scheme1_atal_pension.txt"

create_and_ingest \
  "Pradhan Mantri Ujjwala Yojana" \
  "Free LPG gas connections for women from economically weaker sections." \
  "SUBSIDY" \
  "Ministry of Petroleum and Natural Gas" \
  "https://pmuy.gov.in/" \
  "scheme2_ujjwala.txt"

create_and_ingest \
  "Indira Gandhi National Old Age Pension Scheme" \
  "Monthly financial assistance for elderly citizens below the poverty line." \
  "PENSION" \
  "Ministry of Rural Development" \
  "https://nsap.nic.in/" \
  "scheme3_old_age_pension.txt"

create_and_ingest \
  "Sukanya Samriddhi Yojana" \
  "Government savings scheme securing the financial future of the girl child." \
  "SCHOLARSHIP" \
  "Ministry of Finance" \
  "https://www.nsiindia.gov.in/" \
  "scheme4_sukanya.txt"

create_and_ingest \
  "Pradhan Mantri Awas Yojana - Gramin" \
  "Financial assistance to rural households for construction of a permanent house." \
  "SUBSIDY" \
  "Ministry of Rural Development" \
  "https://pmayg.nic.in/" \
  "scheme5_pmay_gramin.txt"

echo "=== Batch ingestion complete. Review all pending/active rules: ==="
curl -s -H "X-Admin-Key: $ADMIN_KEY" "$BASE_URL/rules/pending" | jq .
