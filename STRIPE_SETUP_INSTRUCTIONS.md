# Stripe Payment Setup Instructions

## Issue: "Payment Setup Failed" Error

The payment system is currently failing because the Stripe API keys in the `.env` file are either expired or placeholder keys.

## How to Fix:

### Step 1: Get Your Stripe Test Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Create a free account if you don't have one
3. In the Dashboard, go to "Developers" → "API keys"
4. Copy your **Test** keys (not Live keys)

### Step 2: Update Your .env File
Replace the placeholder keys in `/Users/ayoogunade/Desktop/amazon-clone/.env`:

```bash
# Replace these placeholder values with your actual Stripe test keys
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

### Step 3: Restart the Backend
After updating the keys:
1. Stop the Flask server (Ctrl+C in terminal)
2. Restart it: `python3 app.py`

### Step 4: Test Payment
1. Go to http://localhost:3000
2. Click "Buy Now" on any product
3. Enter email and use these test card details:
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

## Test Card Numbers
Stripe provides these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`

## Current Status
- ✅ Admin authentication system working
- ✅ Product CRUD operations working  
- ✅ Image upload/display fixed
- ❌ Payment processing needs valid Stripe keys

## Note
This is a demo/educational project. The Stripe integration is fully functional once valid test keys are provided.