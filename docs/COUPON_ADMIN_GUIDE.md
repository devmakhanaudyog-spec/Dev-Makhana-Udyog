# How to Add New Coupon by Admin

## Step-by-Step Guide

### 1. **Access Admin Dashboard**
   - Login as admin at `/admin-login`
   - Navigate to **Coupons & Discounts** tab from the admin sidebar

### 2. **Click "Add Coupon" Button**
   - In the top-right corner of the Coupons page
   - A form will appear with all coupon creation fields

### 3. **Fill in the Coupon Details**

#### **Required Fields:**

**Coupon Code***
- The code customers will use (e.g., `WELCOME20`, `SAVE500`)
- Will be converted to uppercase automatically
- Must be unique (no duplicates allowed)

**Discount Type***
- Choose either:
  - **Percentage (%)** - e.g., 20% off
  - **Flat (₹)** - e.g., ₹500 off

**Discount Value***
- For Percentage: Enter number (e.g., 20 for 20% off)
- For Flat: Enter amount in rupees (e.g., 500)

**Expiry Date***
- Select the date when coupon becomes invalid
- Customers cannot use expired coupons

#### **Optional Fields:**

**Description**
- Display text for the coupon (e.g., "Welcome 20% off")
- Shown to customers in order details

**Minimum Order Value**
- Customers must spend at least this amount to use coupon
- Default: ₹0 (no minimum)
- Example: ₹500 minimum for discount to apply

**Maximum Discount Cap** (Only for Percentage)
- Limits the maximum discount amount
- Example: 20% off with max ₹5000 cap
- Useful to prevent excessive discounts on large orders

**Usage Limit**
- Maximum number of times coupon can be used
- `0` = Unlimited (no restriction)
- Example: 100 = Can be used only 100 times total

**Active Status**
- Check to activate the coupon immediately
- Uncheck to create disabled coupon (can activate later)

### 4. **Submit the Form**
   - Click **"Create Coupon"** button
   - Success message will appear
   - New coupon will appear in the table below

---

## Example Coupon Setups

### **Example 1: First-Time Customer Discount**
```
Code: WELCOME20
Discount Type: Percentage
Discount Value: 20
Min Order Value: 500
Max Discount Cap: 2000
Expiry Date: 31-Dec-2026
Usage Limit: 1000
Active: Yes
Description: "Welcome - 20% off your first order"
```
**Result:** New customers get 20% off (max ₹2000) on orders ₹500+

---

### **Example 2: Flat Discount Campaign**
```
Code: SAVE500
Discount Type: Flat
Discount Value: 500
Min Order Value: 2000
Expiry Date: 15-Feb-2026
Usage Limit: 500
Active: Yes
Description: "Save ₹500 on orders above ₹2000"
```
**Result:** Customers get ₹500 flat off on orders ₹2000+

---

### **Example 3: Bulk Order Incentive**
```
Code: BULK50
Discount Type: Percentage
Discount Value: 15
Min Order Value: 5000
Max Discount Cap: 10000
Expiry Date: 30-Jun-2026
Usage Limit: 0 (Unlimited)
Active: Yes
Description: "15% off on bulk orders above ₹5000"
```
**Result:** Bulk orders get 15% discount (unlimited usage)

---

## Viewing & Managing Coupons

### **Coupon Table Columns:**

| Column | Information |
|--------|-------------|
| **Code** | The coupon code (displayed in green) |
| **Discount** | Discount amount/percentage (shows cap if applicable) |
| **Min Order** | Minimum order value required |
| **Valid Until** | Expiry date of coupon |
| **Usage** | Current usage vs limit (e.g., 45/100 or 12/unlimited) |
| **Status** | Green "Active" or red "Inactive" |
| **Action** | Delete button (trash icon) |

### **Delete a Coupon:**
1. Click the trash icon in the row
2. Confirm deletion in popup
3. Coupon will be removed permanently

---

## How Customers Use Coupons

### **During Checkout:**
1. Customer adds items to cart
2. On checkout page, customer enters coupon code
3. System validates:
   - Code exists and is active
   - Coupon not expired
   - Order value meets minimum requirement
   - Usage limit not exceeded
4. If valid, discount is applied instantly
5. Final amount is reduced by coupon discount

### **Discount Calculation Examples:**

**Percentage Coupon:**
- Cart Total: ₹5000
- Coupon: 20% off, max ₹1000 cap
- Calculation: 5000 × 20% = ₹1000 (= max cap)
- **Final: ₹4000**

**Flat Coupon:**
- Cart Total: ₹3000
- Coupon: ₹500 off
- Calculation: 3000 - 500 = 2500
- **Final: ₹2500**

---

## Important Notes

✅ **Best Practices:**
- Use descriptive coupon codes (e.g., `NEWYEAR2026`, `FESTIVAL50`)
- Set realistic minimum order values
- Use max discount caps for percentage coupons on large orders
- Set expiry dates 1-2 weeks in advance to create urgency
- Track coupon performance via usage count

⚠️ **Important:**
- Coupon codes are **case-insensitive** (AUTO/auto/Auto all work)
- Once a coupon is used, `usedCount` increases automatically
- Customers cannot combine multiple coupons
- Expired coupons cannot be reactivated (create new one)
- Deleted coupons cannot be recovered

---

## API Reference (If Creating via API)

**Create Coupon:** `POST /api/coupons`

```json
{
  "code": "WELCOME20",
  "description": "Welcome discount",
  "discountType": "percentage",
  "discountValue": 20,
  "minOrderValue": 500,
  "maxDiscount": 2000,
  "expiresAt": "2026-12-31T23:59:59Z",
  "usageLimit": 1000,
  "active": true
}
```

**Get All Coupons:** `GET /api/coupons`

**Delete Coupon:** `DELETE /api/coupons/{id}`

**Validate Coupon:** `POST /api/coupons/validate`
```json
{
  "code": "WELCOME20",
  "cartTotal": 5000
}
```
