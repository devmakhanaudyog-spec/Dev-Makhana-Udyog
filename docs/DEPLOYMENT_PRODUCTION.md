# Production Deployment (Vercel + Render)

## Architecture
- Frontend: Vercel (root project)
- Backend API: Render (service in `server/`)
- Database: MongoDB Atlas

## 1) Render (Backend)

### Option A: Blueprint (recommended)
1. In Render, choose **New +** → **Blueprint**.
2. Connect this GitHub repo.
3. Render will detect `render.yaml` at repository root.
4. Set all `sync: false` environment variables in Render dashboard.
5. Deploy and confirm health at `/api/health`.

### Required Render env vars
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `FRONTEND_URL`
- `ALLOWED_ORIGINS`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- Payment keys (`STRIPE_*`, `RAZORPAY_*`) if payments are enabled
- Email keys (`EMAIL_*`, `SMTP_*`) if mail flows are enabled
- `CLOUDINARY_*` if image upload is enabled

## 2) Vercel (Frontend)
1. In Vercel, import this repository.
2. Framework preset: **Create React App**.
3. Root directory: repository root.
4. Build command: `npm run vercel-build`.
5. Output directory: `build`.
6. Add frontend env vars and deploy.

### Required Vercel env vars
- `REACT_APP_API_URL` = your Render API base URL (e.g. `https://dev-mkahna-udyog-api.onrender.com`)
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` (if Stripe is used)
- `REACT_APP_RAZORPAY_KEY_ID` (if Razorpay is used)
- `REACT_APP_GOOGLE_CLIENT_ID` (if Google OAuth is used)

## 3) CORS and callback alignment
- Set backend `CLIENT_URL` and `FRONTEND_URL` to your Vercel domain.
- Set `ALLOWED_ORIGINS` to include all frontend domains (production + preview if needed).
- Set `GOOGLE_CALLBACK_URL` as needed for your auth flow.

## 4) DNS and production checks
- Add custom domains in Vercel and Render if required.
- Verify:
  - Frontend loads and API calls succeed
  - Login/signup works
  - Checkout/payment flow works (if enabled)
  - Password reset/email flow works (if enabled)
  - `/api/health` returns status `ok`

## 5) Security checklist
- Never commit `.env` files with real secrets.
- Rotate any exposed credentials before production.
- Keep Atlas network access restricted (avoid `0.0.0.0/0` long-term).
- Use strong `JWT_SECRET` and admin password.
