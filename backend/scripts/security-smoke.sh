#!/usr/bin/env bash
# End-to-end smoke checks against a locally running API.
# Only read-only / error paths are exercised — no rows are written.
set -uo pipefail

BASE="${1:-http://127.0.0.1:5099/api/v1}"
PASS=0
FAIL=0

expect() {
  local label="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "  ok  $label ($actual)"
    PASS=$((PASS + 1))
  else
    echo "FAIL  $label — expected $expected, got $actual"
    FAIL=$((FAIL + 1))
  fi
}

status() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
body() { curl -s "$@"; }

echo ""
echo "Authentication"

code=$(status -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -d '{"email":"nobody@example.invalid","password":"wrong-password"}')
expect "unknown account login is rejected" 401 "$code"

code=$(status -X POST "$BASE/auth/forgot-password" -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' -d '{"email":"nobody@example.invalid"}')
expect "password reset for an unknown address answers 200" 200 "$code"

msg=$(body -X POST "$BASE/auth/forgot-password" -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' -d '{"email":"nobody@example.invalid"}' | grep -o 'If an account exists[^"]*' | head -1)
if [ -n "$msg" ]; then
  echo "  ok  password reset response is generic (no account disclosure)"
  PASS=$((PASS + 1))
else
  echo "FAIL  password reset response is not generic: $msg"
  FAIL=$((FAIL + 1))
fi

code=$(status -X POST "$BASE/auth/verify-email" -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' -d '{"email":"nobody@example.invalid","code":"000000"}')
expect "verification for an unknown address is rejected" 400 "$code"

code=$(status -X POST "$BASE/auth/reset-password" -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' -d '{"token":"not-a-token","password":"newpassword"}')
expect "reset with a bogus token is rejected" 400 "$code"

code=$(status "$BASE/auth/me")
expect "protected route without a session is 401" 401 "$code"

echo ""
echo "CSRF"

code=$(status -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"nobody@example.invalid","password":"wrong-password"}')
expect "state-changing route without X-Requested-With is 403" 403 "$code"

echo ""
echo "Public tracking"

BROWSER_UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

code=$(status -X POST "$BASE/track/events" -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' -H "User-Agent: $BROWSER_UA" -H 'Accept-Language: en-US' \
  -d '{"apiKey":"trk_does_not_exist","url":"https://example.com"}')
expect "tracking with an unknown tracking id is rejected" 404 "$code"

head -c 200000 /dev/zero | tr '\0' 'a' > /tmp/webpulse-oversized.json
code=$(status -X POST "$BASE/track/events" -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' -H "User-Agent: $BROWSER_UA" -H 'Accept-Language: en-US' \
  --data-binary @/tmp/webpulse-oversized.json)
expect "oversized tracking payload is refused" 413 "$code"
rm -f /tmp/webpulse-oversized.json

echo ""
echo "Rate limiting (auth endpoints)"

last=""
for _ in $(seq 1 14); do
  last=$(status -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
    -H 'X-Requested-With: XMLHttpRequest' \
    -d '{"email":"nobody@example.invalid","password":"wrong-password"}')
done
if [ "$last" = "429" ]; then
  echo "  ok  repeated sign-in attempts are rate limited (429)"
  PASS=$((PASS + 1))
else
  echo "FAIL  sign-in was not rate limited after 14 attempts (got $last)"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
