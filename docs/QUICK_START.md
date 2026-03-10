# 🚀 QUICK START GUIDE - Get Your Project Running in 10 Minutes

## Step 1: Backend Setup (5 minutes)

### 1.1 Install Backend Dependencies
```bash
cd server
npm install
```

### 1.2 Create `.env` file
Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dev-mkahna-udyog
JWT_SECRET=your-super-secret-key-change-in-production
CLIENT_URL=http://localhost:3000
```

### 1.3 Start MongoDB
**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Replace in `.env`:
   ```
  MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dev-mkahna-udyog
   ```

### 1.4 Start Backend Server
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

---

## Step 2: Frontend Setup (5 minutes)

### 2.1 Install Frontend Dependencies
```bash
# From project root (not in server folder)
npm install
```

### 2.2 Create `.env.local` file
Create `.env.local` in project root:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SITE_NAME=Dev Mkahna Udyog
REACT_APP_ENV=development
```

### 2.3 Start Frontend Server
```bash
npm start
```

Your browser should open automatically at:
```
http://localhost:3000
```

---

## ✅ Verify Everything Works

### Test Checklist
- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] MongoDB connection successful
- [ ] No console errors

### Test APIs
```bash
# Get all products
curl http://localhost:5000/api/products

# Register test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123","phone":"1234567890"}'
```

---

## 🧪 Test Account Setup

### Create Admin Account (via MongoDB)

Connect to MongoDB and run:
```javascript
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$12$...", // bcrypt hash of "Admin123"
  phone: "9999999999",
  role: "admin",
  emailVerified: true,
  createdAt: new Date()
})
```

### Create Test User (via App)
1. Go to `http://localhost:3000/login`
2. Click "Sign Up"
3. Fill form and register
4. Login with your credentials

---

## 🎨 Project Structure Quick Reference

```
dev-mkahna-udyog/
├── server/              ← Backend (port 5000)
│   ├── models/         ← Database schemas
│   ├── routes/         ← API endpoints
│   └── server.js       ← Main server
│
├── src/                ← Frontend (port 3000)
│   ├── pages/          ← Page components
│   ├── components/     ← UI components
│   ├── context/        ← Global state
│   └── App.js          ← Main app
│
├── public/             ← Static assets
└── package.json        ← Dependencies
```

---

## 📍 Important URLs

| Purpose | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:5000/api |
| **Products** | http://localhost:3000/products |
| **Admin Dashboard** | http://localhost:3000/admin/dashboard |
| **Login** | http://localhost:3000/login |
| **Checkout** | http://localhost:3000/checkout |

---

## 🔧 Common Issues & Solutions

### ❌ "Port 5000 already in use"
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### ❌ "MongoDB connection failed"
- Check MongoDB is running: `mongod` or MongoDB Atlas connection
- Verify `MONGODB_URI` in `.env`
- Check firewall settings

### ❌ "API calls failing"
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in `.env.local`
- Check browser console for errors

### ❌ "CORS errors"
- Backend CORS is already enabled
- Verify frontend URL is `http://localhost:3000`

---

## 🎯 What to Explore First

### 1. Browse Products
```
http://localhost:3000/products
- Try filtering by category
- Search for products
- Click on a product to see details
```

### 2. Add to Cart
```
- Click "Add to Cart" on any product
- Go to http://localhost:3000/cart
- Update quantities or remove items
```

### 3. Login & Checkout
```
- Go to http://localhost:3000/login
- Register or login
- Go back to cart
- Click "Checkout"
- Fill shipping address
- Click "Place Order"
```

### 4. Admin Dashboard
```
- Login with admin account
- Go to http://localhost:3000/admin/dashboard
- View analytics and charts
```

### 5. View Orders
```
- After placing order, go to http://localhost:3000/orders
- View order status and details
- Download invoice
```

---

## 📦 Features to Test

### Authentication ✅
- Register new account
- Login with credentials
- View profile
- Update profile

### Shopping ✅
- Filter products by category
- Search products
- Add to cart
- Add to wishlist
- View wishlist

### Reviews ✅
- View product reviews
- Write a review (needs purchase)
- Rate product
- See helpful votes

### Checkout ✅
- Enter shipping address
- Select payment method
- Apply coupon code
- See order summary

### Admin ✅
- View dashboard analytics
- Manage products
- View all orders
- Update order status

---

## 🚀 Next Steps (Optional)

### Setup Email Service
```env
# In server/.env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Setup Image Storage (Cloudinary)
```env
# In server/.env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Setup Payment Gateway (Razorpay)
```env
# In server/.env
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# In frontend .env.local
REACT_APP_RAZORPAY_KEY_ID=your-razorpay-key-id
```

### Setup Analytics
```env
# In frontend .env.local
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

## 📊 Testing the API with Postman

### 1. Import API into Postman

**Base URL**: `http://localhost:5000/api`

### 2. Example Requests

**Register User**
```
POST /auth/register
Body: {
  "name": "John",
  "email": "john@test.com",
  "password": "John123",
  "phone": "1234567890"
}
```

**Login**
```
POST /auth/login
Body: {
  "email": "john@test.com",
  "password": "John123"
}
```

**Get Products**
```
GET /products?category=Jewelry&minPrice=100&maxPrice=1000&sort=-price
```

**Create Order**
```
POST /orders
Headers: {
  "Authorization": "Bearer YOUR_TOKEN"
}
Body: {
  "items": [...],
  "shippingAddress": {...},
  "paymentMethod": "COD"
}
```

---

## 🎓 Learning Resources

### Read These Files First
1. `COMPLETE_README.md` - Full overview
2. `IMPLEMENTATION_GUIDE.md` - Feature details
3. `PROJECT_COMPLETION_REPORT.md` - What's included

### Explore Code
1. `src/App.js` - Frontend structure
2. `server/server.js` - Backend structure
3. `src/context/AuthContext.jsx` - Authentication
4. `server/routes/products.js` - API example

---

## ✅ Troubleshooting Commands

```bash
# Check if Node.js is installed
node --version

# Check if npm is installed
npm --version

# Update npm
npm install -g npm@latest

# Clear npm cache
npm cache clean --force

# Reinstall node_modules
rm -rf node_modules
npm install

# Kill process on specific port (Mac/Linux)
lsof -i :5000
kill -9 <PID>
```

---

## 📞 Getting Help

### Documentation
- ✅ COMPLETE_README.md
- ✅ IMPLEMENTATION_GUIDE.md
- ✅ Code comments

### Debug Mode
```bash
# Frontend debug
REACT_APP_DEBUG=true npm start

# Backend debug
DEBUG=* npm run dev
```

### Check Logs
- **Frontend**: Browser DevTools (F12)
- **Backend**: Terminal output
- **Database**: MongoDB Compass

---

## 🎉 You're All Set!

Your e-commerce platform is now running. Explore the features and enjoy! 🚀

---

**Happy Coding! 💻**
