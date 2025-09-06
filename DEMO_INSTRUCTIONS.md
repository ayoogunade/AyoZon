# 🎯 CS Project Demo Instructions

## **Digital Photo Marketplace - Payment Integration Demo**

This project demonstrates **full-stack payment processing** using modern web technologies.

---

## **🚀 How to Run the Demo**

### **1. Start Backend (Terminal 1)**
```bash
cd amazon-clone
python3 app.py
```
**Expected Output:**
```
✅ Successfully connected to MongoDB!
✅ Stripe integration configured!
✅ Running on http://127.0.0.1:5001
```

### **2. Start Frontend (Terminal 2)**
```bash
cd amazon-clone
npm start
```
**Opens:** http://localhost:3000

---

## **🧪 Test Payment Flow**

### **Step 1: Browse Photos**
- View available digital photos on the homepage
- Each photo shows name, description, and price

### **Step 2: Initiate Purchase**
- Click "Buy Now" on any photo
- Enter a **valid email address**
- Click "Proceed to Payment"

### **Step 3: Complete Test Payment**
Use these **Stripe test cards** (no real money involved):

#### **✅ Successful Payment**
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **Result:** Payment succeeds, order confirmation email sent

#### **❌ Declined Payment**
- **Card Number:** `4000 0000 0000 0002`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Result:** Payment fails with error message

#### **🔄 Processing Test**
- **Card Number:** `4000 0000 0000 9995`
- **Result:** Payment requires additional authentication

---

## **💾 What Happens Behind the Scenes**

### **Frontend (React)**
1. User enters email and clicks "Proceed to Payment"
2. Stripe Elements renders secure card input form
3. Card details are encrypted and sent directly to Stripe
4. Payment confirmation triggers order completion

### **Backend (Flask + MongoDB)**
1. Creates Stripe Payment Intent with product details
2. Validates payment completion with Stripe API
3. Saves order record to MongoDB database
4. Sends confirmation email via Resend API

### **Security Features**
- ✅ Card details never touch our servers
- ✅ Stripe handles all PCI compliance
- ✅ Payment validation before order creation
- ✅ Secure API endpoints with error handling

---

## **🎨 Tech Stack Demonstrated**

### **Frontend**
- **React 19** - Modern component-based UI
- **Tailwind CSS** - Utility-first styling
- **Stripe React Components** - Secure payment forms
- **Axios** - HTTP client for API communication

### **Backend**
- **Flask** - Python web framework
- **MongoDB** - NoSQL database for orders/products
- **Stripe API** - Payment processing
- **Resend API** - Transactional emails

### **DevOps**
- **Environment Variables** - Secure configuration
- **Error Handling** - Comprehensive error management
- **CORS** - Cross-origin resource sharing setup

---

## **📊 Database Schema**

### **Products Collection**
```json
{
  "_id": "ObjectId",
  "name": "Photo Name",
  "description": "Photo Description", 
  "price": 25.00,
  "image_url": "https://..."
}
```

### **Orders Collection**
```json
{
  "_id": "ObjectId",
  "email": "customer@email.com",
  "product_id": "ObjectId",
  "product_name": "Photo Name",
  "amount_paid": 25.00,
  "stripe_payment_intent": "pi_...",
  "order_date": "2024-01-01T00:00:00Z",
  "status": "completed"
}
```

---

## **🏆 CS Learning Outcomes**

This project demonstrates:
- **Full-Stack Development** (React + Flask + MongoDB)
- **Payment Integration** (Stripe API)
- **Database Design** (NoSQL schemas)
- **API Development** (RESTful endpoints)
- **Security Best Practices** (Environment variables, input validation)
- **Error Handling** (Frontend + Backend)
- **Third-Party Integrations** (Stripe + Email services)

---

## **🎬 Demo Script for Presentations**

1. **"This is a digital photo marketplace with real payment processing"**
2. **"I'll demonstrate the complete purchase flow"**
3. **"Using Stripe test cards to simulate real transactions"**
4. **"The backend validates payments and creates orders"**
5. **"Customers receive email confirmations automatically"**
6. **"All data is securely stored in MongoDB"**

**Perfect for:** Capstone projects, job interviews, portfolio demonstrations!