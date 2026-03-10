#!/bin/bash

# DEV MKAHNA UDYOG - QUICK COMMAND REFERENCE
# ==============================================================================

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║          DEV MKAHNA UDYOG - QUICK COMMAND REFERENCE                       ║"
echo "║                          Database: Local MongoDB                           ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"

echo ""
echo "📋 QUICK START COMMANDS:"
echo ""
echo "1️⃣  Start MongoDB (Required first)"
echo "   Command: mongod"
echo ""

echo "2️⃣  Navigate to Server Directory"
echo "   Command: cd server"
echo ""

echo "3️⃣  Install Dependencies"
echo "   Command: npm install"
echo ""

echo "4️⃣  Seed Database with Sample Data"
echo "   Command: node seed-complete.js"
echo "   Creates: Admin user, 3 test users, 20 products, 3 coupons, 2 orders"
echo ""

echo "5️⃣  Start Backend Server"
echo "   Command: npm run dev"
echo "   Runs on: http://localhost:5000"
echo ""

echo "6️⃣  Start Frontend (From root directory)"
echo "   Command: npm start"
echo "   Runs on: http://localhost:3000"
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "🔑 TEST CREDENTIALS:"
echo ""
echo "Admin Login:"
echo "  Email: admin@example.com"
echo "  Password: <from server/.env>"
echo ""

echo "User Logins:"
echo "  Email: john@example.com      | Password: user12345"
echo "  Email: jane@example.com      | Password: user12345"
echo "  Email: michael@example.com   | Password: user12345"
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "🔧 USEFUL COMMANDS:"
echo ""
echo "Clear Database (Delete collections):"
echo "  use dev-mkahna-udyog"
echo "  db.users.deleteMany({})"
echo "  db.products.deleteMany({})"
echo "  db.orders.deleteMany({})"
echo "  db.coupons.deleteMany({})"
echo ""

echo "Then reseed:"
echo "  node seed-complete.js"
echo ""

echo "Reset Everything (MongoDB shell):"
echo "  use dev-mkahna-udyog"
echo "  db.dropDatabase()"
echo "  exit"
echo "  node seed-complete.js"
echo ""

echo "View Database Contents (MongoDB shell):"
echo "  use dev-mkahna-udyog"
echo "  db.users.find().pretty()"
echo "  db.products.find().pretty()"
echo "  db.orders.find().pretty()"
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "📊 API ENDPOINTS:"
echo ""
echo "Authentication:"
echo "  POST   http://localhost:5000/api/auth/register"
echo "  POST   http://localhost:5000/api/auth/login"
echo "  POST   http://localhost:5000/api/auth/admin-login"
echo "  GET    http://localhost:5000/api/auth/me"
echo "  PUT    http://localhost:5000/api/auth/profile"
echo ""

echo "Products:"
echo "  GET    http://localhost:5000/api/products"
echo "  GET    http://localhost:5000/api/products/:id"
echo "  GET    http://localhost:5000/api/products/meta/categories"
echo "  GET    http://localhost:5000/api/products/meta/price-range"
echo ""

echo "Orders:"
echo "  POST   http://localhost:5000/api/orders"
echo "  GET    http://localhost:5000/api/orders/my"
echo "  GET    http://localhost:5000/api/orders/:id"
echo "  PUT    http://localhost:5000/api/orders/:id/status (Admin)"
echo ""

echo "Admin:"
echo "  GET    http://localhost:5000/api/admin/users"
echo "  GET    http://localhost:5000/api/admin/users/:id"
echo "  GET    http://localhost:5000/api/admin/products"
echo "  GET    http://localhost:5000/api/analytics/dashboard"
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "🐛 TROUBLESHOOTING:"
echo ""
echo "MongoDB not connecting?"
echo "  ✓ Ensure MongoDB is running: mongod"
echo "  ✓ Check MONGODB_URI in server/.env"
echo ""

echo "Port already in use?"
echo "  ✓ Kill the process: npx kill-port 5000"
echo "  ✓ Or change PORT in server/.env"
echo ""

echo "Dependencies missing?"
echo "  ✓ npm install (in both root and server directories)"
echo ""

echo "Database needs reset?"
echo "  ✓ Delete collections in MongoDB"
echo "  ✓ Run: node seed-complete.js"
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "📚 DOCUMENTATION:"
echo ""
echo "  • BACKEND_SETUP.md - Complete backend documentation"
echo "  • SETUP_COMPLETE.md - Setup summary with all details"
echo "  • COMPLETION_SUMMARY.txt - Project completion checklist"
echo "  • server/routes/*.js - Individual route documentation in comments"
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "✅ All systems ready! Follow the steps above to get started."
echo ""
