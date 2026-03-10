# Dev Mkahna Udyog

Full-stack MERN e-commerce project (frontend + backend) with authentication, admin dashboard, orders, reviews, coupons, Stripe/Razorpay, and email workflows.

## Project Identity

- Display name: Dev Mkahna Udyog
- Frontend package: dev-mkahna-udyog
- Backend package: dev-mkahna-udyog-server

## Quick Start

```bash
git clone <your-new-repo-url>
cd dev-mkahna-udyog

# frontend deps
npm install --legacy-peer-deps

# backend deps
cd server
npm install
cd ..
```

## Environment Setup

### Frontend

```bash
copy .env.example .env.local
```

Required values in `.env.local`:

- `REACT_APP_API_URL`
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` (if Stripe is used)
- `REACT_APP_RAZORPAY_KEY_ID` (if Razorpay is used)

### Backend

```bash
copy server/.env.example server/.env
```

Required values in `server/.env`:

- `MONGODB_URI` (or legacy `MONGO_URI`)
- `JWT_SECRET`
- `CLIENT_URL` (or `FRONTEND_URL`)

Optional but recommended:

- Email/SMTP keys (`EMAIL_*`, `SMTP_*`)
- Payment keys (`STRIPE_*`, `RAZORPAY_*`)
- Cloudinary keys (`CLOUDINARY_*`)

## Run Locally

Terminal 1 (backend):

```bash
cd server
npm run dev
```

Terminal 2 (frontend):

```bash
npm start
```

## Tech Stack

- Frontend: React (CRA), TailwindCSS, Axios, React Router
- Backend: Node.js, Express, MongoDB/Mongoose, JWT
- Payments: Stripe, Razorpay
- Utilities: Nodemailer, Cloudinary

## Deployment

- Production guide: `docs/DEPLOYMENT_PRODUCTION.md`

## Notes

- No credentials are committed in templates.
- Backend now fails fast with a clear error if required env variables are missing.
