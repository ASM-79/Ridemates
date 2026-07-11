#!/bin/bash
# Creates one real rider request plus a handful of fake overlapping/non-overlapping
# requests and driver routes, then runs the AI matcher so you can see exactly
# what /api/match does with a realistic pool.
set -e

API=http://localhost:4000

echo "=== 1. Your real ride request ==="
YOU=$(curl -s -X POST $API/commute-requests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "You",
    "email": "you.test@example.com",
    "originAddress": "10410 Wunderlich Dr, Cupertino, CA",
    "destAddress": "De Anza College, Cupertino, CA",
    "departureTime": "2026-07-11T16:00:00",
    "flexibilityMinutes": 20
  }')
echo "$YOU" | python3 -m json.tool
YOU_ID=$(echo "$YOU" | python3 -c "import sys,json;print(json.load(sys.stdin)['commuteRequest']['id'])")

echo ""
echo "=== 2. Fake rider #1 — very close, overlapping time (should match) ==="
curl -s -X POST $API/commute-requests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Nearby",
    "email": "priya.fake@example.com",
    "originAddress": "10500 Wunderlich Dr, Cupertino, CA",
    "destAddress": "De Anza College, Cupertino, CA",
    "departureTime": "2026-07-11T15:50:00",
    "flexibilityMinutes": 20
  }' | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['commuteRequest']['origin_address'],'->',d['commuteRequest']['dest_address'],d['commuteRequest']['departure_time'])"

echo ""
echo "=== 3. Fake rider #2 — same street, slightly later (should match) ==="
curl -s -X POST $API/commute-requests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marcus Neighbor",
    "email": "marcus.fake@example.com",
    "originAddress": "10801 Wunderlich Dr, Cupertino, CA",
    "destAddress": "De Anza College, Cupertino, CA",
    "departureTime": "2026-07-11T16:10:00",
    "flexibilityMinutes": 15
  }' | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['commuteRequest']['origin_address'],'->',d['commuteRequest']['dest_address'],d['commuteRequest']['departure_time'])"

echo ""
echo "=== 4. Fake rider #3 — unrelated route, same time (control — should NOT match) ==="
curl -s -X POST $API/commute-requests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fred Faraway",
    "email": "fred.fake@example.com",
    "originAddress": "San Jose, CA",
    "destAddress": "Santa Clara University, CA",
    "departureTime": "2026-07-11T16:00:00",
    "flexibilityMinutes": 15
  }' | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['commuteRequest']['origin_address'],'->',d['commuteRequest']['dest_address'],d['commuteRequest']['departure_time'])"

echo ""
echo "=== 5. A fake driver's scheduled route covering the same corridor (mechanism B) ==="
curl -s -X POST $API/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dana Driver",
    "email": "dana.fake@example.com",
    "startAddress": "10600 Wunderlich Dr, Cupertino, CA",
    "endAddress": "De Anza College, Cupertino, CA",
    "schedule": {"days": ["Fri"], "time": "16:00"},
    "seatsAvailable": 3
  }' | python3 -m json.tool

echo ""
echo "=== 6. Run the AI matcher (POST /api/match) ==="
curl -s -X POST $API/api/match | python3 -m json.tool

echo ""
echo "=== 7. Check your result specifically ==="
curl -s $API/commute-requests/$YOU_ID/result | python3 -m json.tool

echo ""
echo "YOUR_REQUEST_ID=$YOU_ID"
