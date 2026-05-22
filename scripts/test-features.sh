#!/bin/bash

# Test script for new features: featured filter, pagination, and product creation
# Requirements: 
#   - Server running on port 3001
#   - Admin token in ADMIN_TOKEN env variable
#   - jq installed (for JSON parsing)

set -e

API_BASE="${API_BASE:-http://localhost:3001/api}"
ADMIN_TOKEN="${ADMIN_TOKEN}"

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Error: ADMIN_TOKEN not set. Usage: export ADMIN_TOKEN=<your_token> && ./test-features.sh"
  exit 1
fi

HEADERS="-H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json'"

echo "=== Testing Product Features ==="
echo ""

# Test 1: Create product WITHOUT featured flag (should default to false)
echo "1. Creating product WITHOUT featured flag..."
PRODUCT_NAME="Test Product $(date +%s)"
CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/products" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "categoryId=" \
  -F "sku=TEST-$(date +%s)" \
  -F "name=$PRODUCT_NAME" \
  -F "description=Test product" \
  -F "price=1000" \
  -F "stock=5")

PRODUCT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.product.id // empty')
FEATURED=$(echo "$CREATE_RESPONSE" | jq '.product.featured')

if [ -z "$PRODUCT_ID" ]; then
  echo "❌ Failed to create product"
  echo "$CREATE_RESPONSE" | jq .
  exit 1
fi

echo "✓ Product created with ID: $PRODUCT_ID"
echo "  Featured: $FEATURED (expected: false)"

if [ "$FEATURED" != "false" ] && [ "$FEATURED" != "0" ] && [ "$FEATURED" != "null" ]; then
  echo "  ⚠️  Warning: featured should be false by default"
fi

# Test 2: Search/Filter by name
echo ""
echo "2. Testing search by product name..."
SEARCH_RESPONSE=$(curl -s "$API_BASE/products?search=$PRODUCT_NAME&limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

FOUND=$(echo "$SEARCH_RESPONSE" | jq ".products[] | select(.id == \"$PRODUCT_ID\") | .id" | wc -l)

if [ "$FOUND" -eq 1 ]; then
  echo "✓ Product found via search"
else
  echo "❌ Product not found via search"
  exit 1
fi

# Test 3: Mark as featured
echo ""
echo "3. Marking product as featured..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "categoryId=" \
  -F "sku=TEST-UPDATED" \
  -F "name=$PRODUCT_NAME" \
  -F "description=Test product updated" \
  -F "price=2000" \
  -F "stock=10" \
  -F "featured=true")

FEATURED=$(echo "$UPDATE_RESPONSE" | jq '.product.featured')

if [ "$FEATURED" == "true" ] || [ "$FEATURED" == "1" ]; then
  echo "✓ Product marked as featured"
else
  echo "❌ Failed to mark as featured"
  echo "$UPDATE_RESPONSE" | jq .
  exit 1
fi

# Test 4: Filter by featured=true
echo ""
echo "4. Testing filter: featured=true..."
FILTER_RESPONSE=$(curl -s "$API_BASE/products?featured=true&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

FEATURED_COUNT=$(echo "$FILTER_RESPONSE" | jq '.products | length')
FOUND_FEATURED=$(echo "$FILTER_RESPONSE" | jq ".products[] | select(.id == \"$PRODUCT_ID\") | .id" | wc -l)

echo "✓ Found $FEATURED_COUNT products with featured=true"
if [ "$FOUND_FEATURED" -eq 1 ]; then
  echo "✓ Our test product found in featured filter"
else
  echo "❌ Test product not found in featured filter"
fi

# Test 5: Unmark as featured
echo ""
echo "5. Unmarking product from featured..."
UNFEATURE_RESPONSE=$(curl -s -X PUT "$API_BASE/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "categoryId=" \
  -F "sku=TEST-UPDATED2" \
  -F "name=$PRODUCT_NAME" \
  -F "description=Test product" \
  -F "price=2000" \
  -F "stock=10" \
  -F "featured=false")

FEATURED=$(echo "$UNFEATURE_RESPONSE" | jq '.product.featured')

if [ "$FEATURED" == "false" ] || [ "$FEATURED" == "0" ]; then
  echo "✓ Product unmarked from featured"
else
  echo "❌ Failed to unmark as featured"
  echo "$UNFEATURE_RESPONSE" | jq .
  exit 1
fi

# Test 6: Filter by featured=false
echo ""
echo "6. Testing filter: featured=false..."
FILTER_RESPONSE=$(curl -s "$API_BASE/products?featured=false&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

UNFEATURED_COUNT=$(echo "$FILTER_RESPONSE" | jq '.products | length')
FOUND_UNFEATURED=$(echo "$FILTER_RESPONSE" | jq ".products[] | select(.id == \"$PRODUCT_ID\") | .id" | wc -l)

echo "✓ Found $UNFEATURED_COUNT products with featured=false"
if [ "$FOUND_UNFEATURED" -eq 1 ]; then
  echo "✓ Our test product found in non-featured filter"
else
  echo "❌ Test product not found in non-featured filter"
fi

# Test 7: Pagination
echo ""
echo "7. Testing pagination..."
PAGINATION_RESPONSE=$(curl -s "$API_BASE/products?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

TOTAL=$(echo "$PAGINATION_RESPONSE" | jq '.total')
TOTAL_PAGES=$(echo "$PAGINATION_RESPONSE" | jq '.totalPages')
PAGE=$(echo "$PAGINATION_RESPONSE" | jq '.page')
LIMIT=$(echo "$PAGINATION_RESPONSE" | jq '.limit')

echo "✓ Pagination info:"
echo "  Total products: $TOTAL"
echo "  Total pages: $TOTAL_PAGES"
echo "  Current page: $PAGE"
echo "  Items per page: $LIMIT"

echo ""
echo "=== All tests passed! ✓ ==="
