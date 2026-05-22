# Verification Scripts

This directory contains scripts to verify the product management features.

## `test-features.sh`

End-to-end test for:
- Creating products without featured flag (defaults to false)
- Searching products by name
- Marking/unmarking products as featured
- Filtering by featured status
- Pagination info

**Requirements:**
- API server running (default: `http://localhost:3001/api`)
- Admin authentication token
- `curl` and `jq` installed

**Usage:**

```bash
# Set your admin token
export ADMIN_TOKEN="your-admin-token-here"

# Run the test
./test-features.sh

# Or specify custom API base
export API_BASE="http://localhost:3001/api"
./test-features.sh
```

**Expected Output:**
```
=== Testing Product Features ===

1. Creating product WITHOUT featured flag...
✓ Product created with ID: ...
  Featured: false (expected: false)

2. Testing search by product name...
✓ Product found via search

3. Marking product as featured...
✓ Product marked as featured

4. Testing filter: featured=true...
✓ Found N products with featured=true
✓ Our test product found in featured filter

5. Unmarking product from featured...
✓ Product unmarked from featured

6. Testing filter: featured=false...
✓ Found N products with featured=false
✓ Our test product found in non-featured filter

7. Testing pagination...
✓ Pagination info:
  Total products: N
  Total pages: M
  Current page: 1
  Items per page: 10

=== All tests passed! ✓ ===
```

## How to obtain ADMIN_TOKEN

1. Login via the API:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }' | jq '.token'
```

2. Copy the token and export it:
```bash
export ADMIN_TOKEN="the-token-from-above"
```

3. Run the test:
```bash
./test-features.sh
```
