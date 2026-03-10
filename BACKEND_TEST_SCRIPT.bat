@echo off
REM E-Commerce Backend Testing Script for Windows
REM Tests all customer submission endpoints and admin retrieval endpoints

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:5000
set ADMIN_TOKEN=

echo.
echo ==========================================
echo E-Commerce Backend Testing Script
echo ==========================================
echo.

REM Test 1: Health Check
echo Test 1: Server Health Check
echo Endpoint: GET /api/health
curl -s -X GET "%BASE_URL%/api/health" 
echo.
echo.

REM Test 2: Contact Form Submission
echo Test 2: Contact Form Submission
echo Endpoint: POST /api/contact/submit
curl -s -X POST "%BASE_URL%/api/contact/submit" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Test Customer\", \"email\": \"test@example.com\", \"phone\": \"9876543210\", \"subject\": \"Product Inquiry\", \"message\": \"I would like to know more about your makhana products\"}"
echo.
echo.

REM Test 3: Free Sample Submission
echo Test 3: Free Sample Submission
echo Endpoint: POST /api/free-samples/submit
curl -s -X POST "%BASE_URL%/api/free-samples/submit" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Sample Requester\", \"company\": \"Test Company\", \"phone\": \"9123456789\", \"email\": \"requester@example.com\", \"addressLine1\": \"123 Test Street\", \"city\": \"Mumbai\", \"district\": \"Mumbai\", \"state\": \"Maharashtra\", \"pincode\": \"400001\", \"makhanaType\": \"7-suta\", \"requirement\": \"Premium grade\", \"message\": \"Please send samples\"}"
echo.
echo.

REM Test 4: Bulk Order Submission
echo Test 4: Bulk Order Submission
echo Endpoint: POST /api/bulk-orders/submit
curl -s -X POST "%BASE_URL%/api/bulk-orders/submit" ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\": \"Bulk Manager\", \"company\": \"ABC Traders\", \"phone\": \"9988776655\", \"email\": \"bulk@abctraders.com\", \"addressLine1\": \"456 Business Ave\", \"city\": \"Delhi\", \"district\": \"Delhi\", \"state\": \"Delhi\", \"pincode\": \"110001\", \"makhanaType\": \"6-suta\", \"monthlyVolume\": \"2000 kg\", \"packaging\": \"25kg\", \"postSampleQty\": \"500 kg\"}"
echo.
echo.

REM Test 5: Get All Products (Public)
echo Test 5: Get All Products (Public)
echo Endpoint: GET /api/products
curl -s -X GET "%BASE_URL%/api/products"
echo.
echo.

REM Test 6: Get Specific Product (Public)
echo Test 6: Get Specific Product
echo Endpoint: GET /api/products/7-suta
curl -s -X GET "%BASE_URL%/api/products/7-suta"
echo.
echo.

echo.
echo ==========================================
echo Testing Complete!
echo ==========================================
echo.
echo Tested endpoints:
echo + Health Check
echo + Contact Form Submission
echo + Free Sample Submission  
echo + Bulk Order Submission
echo + Get All Products (Public)
echo + Get Specific Product (Public)
echo.
echo Note: For admin endpoints, you need to:
echo 1. Login with admin credentials
echo 2. Get the auth token from login response
echo 3. Use that token in Authorization header for admin endpoints
echo.
echo Example admin login:
echo curl -X POST http://localhost:5000/api/auth/login ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"email\": \"admin@example.com\", \"password\": \"your_admin_password\"}"
echo.
echo Then use the returned token for:
echo curl -X GET http://localhost:5000/api/admin/messages ^
echo   -H "Authorization: Bearer YOUR_TOKEN"
echo.

pause
