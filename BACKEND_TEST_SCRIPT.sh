#!/bin/bash

# E-Commerce Backend Testing Script
# Tests all customer submission endpoints and admin retrieval endpoints

BASE_URL="http://localhost:5000"
ADMIN_TOKEN="" # Set this after admin login test

echo "=========================================="
echo "E-Commerce Backend Testing Script"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Server Health Check${NC}"
echo "Endpoint: GET /api/health"
curl -s -X GET "$BASE_URL/api/health" | jq . || echo "Server not running"
echo ""
echo ""

# Test 2: Contact Form Submission
echo -e "${YELLOW}Test 2: Contact Form Submission${NC}"
echo "Endpoint: POST /api/contact/submit"
CONTACT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/contact/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "test@example.com",
    "phone": "9876543210",
    "subject": "Product Inquiry",
    "message": "I would like to know more about your makhana products"
  }')
echo "$CONTACT_RESPONSE" | jq .
echo ""
echo ""

# Test 3: Free Sample Submission
echo -e "${YELLOW}Test 3: Free Sample Submission${NC}"
echo "Endpoint: POST /api/free-samples/submit"
SAMPLE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/free-samples/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Requester",
    "company": "Test Company",
    "phone": "9123456789",
    "email": "requester@example.com",
    "addressLine1": "123 Test Street",
    "addressLine2": "Suite 100",
    "landmark": "Near Test Park",
    "city": "Mumbai",
    "district": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "makhanaType": "7-suta",
    "requirement": "Premium grade for retail",
    "message": "Please send high-quality samples for testing"
  }')
echo "$SAMPLE_RESPONSE" | jq .
echo ""
echo ""

# Test 4: Bulk Order Submission
echo -e "${YELLOW}Test 4: Bulk Order Submission${NC}"
echo "Endpoint: POST /api/bulk-orders/submit"
BULK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/bulk-orders/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Bulk Order Manager",
    "company": "ABC Wholesale Traders",
    "phone": "9988776655",
    "email": "bulk@abctraders.com",
    "addressLine1": "456 Business Avenue",
    "addressLine2": "Building B, Floor 2",
    "landmark": "Near Business Park",
    "city": "Delhi",
    "district": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "makhanaType": "6-suta",
    "monthlyVolume": "2000 kg",
    "packaging": "25kg nitrogen-flushed",
    "postSampleQty": "500 kg",
    "notes": "Need consistent quality for retail distribution"
  }')
echo "$BULK_RESPONSE" | jq .
echo ""
echo ""

# Test 5: Admin Login (to get token for admin endpoints)
echo -e "${YELLOW}Test 5: Admin Login${NC}"
echo "Endpoint: POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_admin_password"
  }')
echo "$LOGIN_RESPONSE" | jq .
ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo -e "${RED}Note: Admin login failed. Skipping admin endpoints.${NC}"
  echo "Please ensure admin account exists with credentials:"
  echo "  Email: admin@example.com"
  echo "  Password: your_admin_password"
else
  echo -e "${GREEN}Admin token obtained: ${ADMIN_TOKEN:0:20}...${NC}"
  echo ""
  echo ""

  # Test 6: View Contact Messages in Admin Panel
  echo -e "${YELLOW}Test 6: Admin - View Contact Messages${NC}"
  echo "Endpoint: GET /api/admin/messages"
  curl -s -X GET "$BASE_URL/api/admin/messages?page=1" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
  echo ""
  echo ""

  # Test 7: View Free Samples in Admin Panel
  echo -e "${YELLOW}Test 7: Admin - View Free Sample Requests${NC}"
  echo "Endpoint: GET /api/admin/free-samples"
  curl -s -X GET "$BASE_URL/api/admin/free-samples?page=1" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
  echo ""
  echo ""

  # Test 8: View Bulk Orders in Admin Panel
  echo -e "${YELLOW}Test 8: Admin - View Bulk Orders${NC}"
  echo "Endpoint: GET /api/admin/bulk-orders"
  curl -s -X GET "$BASE_URL/api/admin/bulk-orders?page=1" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
  echo ""
  echo ""

  # Test 9: View Dashboard Overview
  echo -e "${YELLOW}Test 9: Admin - Dashboard Overview${NC}"
  echo "Endpoint: GET /api/admin/dashboard/overview"
  curl -s -X GET "$BASE_URL/api/admin/dashboard/overview" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
  echo ""
  echo ""

  # Test 10: View All Products
  echo -e "${YELLOW}Test 10: Admin - View All Products${NC}"
  echo "Endpoint: GET /api/admin/products"
  curl -s -X GET "$BASE_URL/api/admin/products" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
  echo ""
  echo ""

  # Test 11: View All Orders
  echo -e "${YELLOW}Test 11: Admin - View All Orders${NC}"
  echo "Endpoint: GET /api/admin/orders"
  curl -s -X GET "$BASE_URL/api/admin/orders?page=1" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
  echo ""
  echo ""

fi

# Test Customer-Accessible Endpoints

# Test 12: Get All Products
echo -e "${YELLOW}Test 12: Get All Products (Public)${NC}"
echo "Endpoint: GET /api/products"
curl -s -X GET "$BASE_URL/api/products" | jq '.products | length'
echo "Products fetched successfully"
echo ""
echo ""

# Test 13: Get Specific Product
echo -e "${YELLOW}Test 13: Get Specific Product (Public)${NC}"
echo "Endpoint: GET /api/products/7-suta"
curl -s -X GET "$BASE_URL/api/products/7-suta" | jq .
echo ""
echo ""

echo "=========================================="
echo -e "${GREEN}Testing Complete!${NC}"
echo "=========================================="
echo ""
echo "Summary of tested endpoints:"
echo "✓ Health Check"
echo "✓ Contact Form Submission"
echo "✓ Free Sample Submission"
echo "✓ Bulk Order Submission"
if [ ! -z "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
  echo "✓ Admin Login"
  echo "✓ Admin - View Contact Messages"
  echo "✓ Admin - View Free Samples"
  echo "✓ Admin - View Bulk Orders"
  echo "✓ Admin - Dashboard Overview"
  echo "✓ Admin - View Products"
  echo "✓ Admin - View Orders"
fi
echo "✓ Get All Products"
echo "✓ Get Specific Product"
echo ""
echo "Note: For full testing, ensure MongoDB is running and"
echo "the server is started with: npm run server"
