from flask import Flask, request, jsonify, send_from_directory, url_for, session
from flask_pymongo import PyMongo
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from bson.objectid import ObjectId
import re
import requests
import stripe
from datetime import datetime
from functools import wraps
import base64
import mimetypes

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
CORS(app, supports_credentials=True)

# MongoDB Configuration
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise ValueError("No MONGO_URI environment variable found")

# Handle URI formatting
if "?" in mongo_uri:
    base_uri, params = mongo_uri.split("?", 1)
else:
    base_uri = mongo_uri
    params = ""

if base_uri.endswith("/"):
    base_uri = base_uri[:-1]

if "/amazon_clone" not in base_uri:
    base_uri += "/amazon_clone"

if params:
    mongo_uri = f"{base_uri}?{params}"
else:
    mongo_uri = base_uri

app.config["MONGO_URI"] = mongo_uri
print(f"Connecting to MongoDB with URI: {mongo_uri}")

try:
    mongo = PyMongo(app)
    mongo.db.command('ping')
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {str(e)}")
    raise

# Stripe Configuration
stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
stripe_publishable_key = os.getenv("STRIPE_PUBLISHABLE_KEY")
if not stripe_secret_key:
    raise ValueError("No STRIPE_SECRET_KEY environment variable found")
if not stripe_publishable_key:
    raise ValueError("No STRIPE_PUBLISHABLE_KEY environment variable found")

stripe.api_key = stripe_secret_key
print("Stripe integration configured!")

# Upload settings
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Simple email validation
def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email)

# Admin authentication
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('is_admin'):
            return jsonify({"error": "Admin access required"}), 401
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def home():
    return {"message": "Welcome to Amazon Clone API!"}

@app.route('/config')
def get_publishable_key():
    return {"publishable_key": stripe_publishable_key}

@app.route('/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['is_admin'] = True
            return jsonify({"message": "Login successful", "is_admin": True}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": "Login failed", "details": str(e)}), 500

@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('is_admin', None)
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/admin/status', methods=['GET'])
def admin_status():
    return jsonify({"is_admin": session.get('is_admin', False)}), 200

@app.route('/add_product', methods=['POST'])
@admin_required
def add_product():
    try:
        name = request.form.get('name')
        price = request.form.get('price')
        description = request.form.get('description')
        image_file = request.files.get('image')

        if not name or not price or not description:
            return jsonify({"error": "Missing required fields"}), 400

        try:
            price = float(price)
        except ValueError:
            return jsonify({"error": "Invalid price value"}), 400

        image_url = ''
        if image_file and image_file.filename:
            if allowed_file(image_file.filename):
                filename = f"{uuid.uuid4().hex}_{secure_filename(image_file.filename)}"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                image_file.save(filepath)
                image_url = url_for('uploaded_file', filename=filename, _external=True)

        product = {
            'name': name,
            'price': price,
            'description': description,
            'image_url': image_url
        }

        result = mongo.db.products.insert_one(product)

        return jsonify({
            "message": "Product added successfully!",
            "product_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print(f"Error adding product: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500

@app.route('/products', methods=['GET'])
def get_products():
    try:
        products = mongo.db.products.find()
        product_list = []
        for product in products:
            product_data = {
                "id": str(product['_id']),
                "name": product['name'],
                "image_url": product.get('image_url', ''),
                "price": product['price'],
                "description": product['description']
            }
            product_list.append(product_data)

        return jsonify(product_list), 200

    except Exception as e:
        print(f"Error getting products: {str(e)}")
        return jsonify({"error": "Database error", "message": str(e)}), 500

@app.route('/products/<product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    try:
        name = request.form.get('name')
        price = request.form.get('price')
        description = request.form.get('description')
        image_file = request.files.get('image')

        if not name or not price or not description:
            return jsonify({"error": "Missing required fields"}), 400

        try:
            price = float(price)
        except ValueError:
            return jsonify({"error": "Invalid price value"}), 400

        # Get existing product
        existing_product = mongo.db.products.find_one({"_id": ObjectId(product_id)})
        if not existing_product:
            return jsonify({"error": "Product not found"}), 404

        # Handle image upload
        image_url = existing_product.get('image_url', '')
        if image_file and image_file.filename:
            if allowed_file(image_file.filename):
                filename = f"{uuid.uuid4().hex}_{secure_filename(image_file.filename)}"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                image_file.save(filepath)
                image_url = url_for('uploaded_file', filename=filename, _external=True)
                
                # Delete old image file if it exists and is local
                old_image_url = existing_product.get('image_url', '')
                if old_image_url and 'localhost' in old_image_url:
                    try:
                        old_filename = old_image_url.split('/')[-1]
                        old_filepath = os.path.join(app.config['UPLOAD_FOLDER'], old_filename)
                        if os.path.exists(old_filepath):
                            os.remove(old_filepath)
                    except:
                        pass

        update_data = {
            'name': name,
            'price': price,
            'description': description,
            'image_url': image_url
        }

        result = mongo.db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            return jsonify({"error": "No changes made"}), 400

        return jsonify({
            "message": "Product updated successfully!",
            "product_id": product_id
        }), 200

    except Exception as e:
        print(f"Error updating product: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500

@app.route('/products/<product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    try:
        # Get the product to delete associated image
        product = mongo.db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Delete associated image file if it's local
        image_url = product.get('image_url', '')
        if image_url and 'localhost' in image_url:
            try:
                filename = image_url.split('/')[-1]
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                if os.path.exists(filepath):
                    os.remove(filepath)
            except Exception as img_error:
                print(f"Error deleting image file: {str(img_error)}")

        # Delete the product from database
        result = mongo.db.products.delete_one({"_id": ObjectId(product_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Product not found or already deleted"}), 404

        return jsonify({
            "message": "Product deleted successfully!",
            "product_id": product_id
        }), 200

    except Exception as e:
        print(f"Error deleting product: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/create-payment-intent', methods=['POST'])
def create_payment():
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        email = data.get('email')
        
        if not product_id or not email:
            return jsonify({"error": "Missing product_id or email"}), 400
            
        if not is_valid_email(email):
            return jsonify({"error": "Invalid email address"}), 400
        
        # Get product details
        product = mongo.db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        # Create payment intent
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(product['price'] * 100),  # Stripe expects cents
                currency='usd',
                metadata={
                    'product_id': product_id,
                    'product_name': product['name'],
                    'customer_email': email
                }
            )
        except stripe.error.StripeError as e:
            print(f"Stripe error: {str(e)}")
            return jsonify({"error": "Payment setup failed", "details": str(e)}), 500
        
        return jsonify({
            'client_secret': intent.client_secret,
            'product_name': product['name'],
            'amount': product['price']
        })
        
    except Exception as e:
        print(f"Error creating payment intent: {str(e)}")
        return jsonify({"error": "Payment setup failed"}), 500

@app.route('/confirm-payment', methods=['POST'])
def confirm_payment():
    try:
        data = request.get_json()
        payment_intent_id = data.get('payment_intent_id')
        
        if not payment_intent_id:
            return jsonify({"error": "Missing payment_intent_id"}), 400
        
        # Retrieve payment intent from Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status != 'succeeded':
            return jsonify({"error": "Payment not completed"}), 400
        
        # Get product and customer info from metadata
        product_id = intent.metadata['product_id']
        product_name = intent.metadata['product_name']
        customer_email = intent.metadata['customer_email']
        
        # Save order in database
        order = {
            "email": customer_email,
            "product_id": product_id,
            "product_name": product_name,
            "amount_paid": intent.amount / 100,  # Convert back from cents
            "stripe_payment_intent": payment_intent_id,
            "order_date": datetime.utcnow(),
            "status": "completed"
        }
        order_result = mongo.db.orders.insert_one(order)
        
        # Send confirmation email with image attachment
        product = mongo.db.products.find_one({"_id": ObjectId(product_id)})
        resend_url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {os.getenv('RESEND_API_KEY')}",
            "Content-Type": "application/json"
        }
        
        # Prepare email data
        email_data = {
            "from": os.getenv("FROM_EMAIL"),
            "to": customer_email,
            "subject": f"Your Digital Photo - {product_name}",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Thank you for your purchase! 🎉</h2>
                    <p>Your order has been successfully processed and your digital photo is ready for download.</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #555; margin-top: 0;">Order Details:</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li><strong>Product:</strong> {product_name}</li>
                            <li><strong>Amount Paid:</strong> ${intent.amount / 100:.2f}</li>
                            <li><strong>Order ID:</strong> {str(order_result.inserted_id)}</li>
                            <li><strong>Order Date:</strong> {datetime.utcnow().strftime('%B %d, %Y')}</li>
                        </ul>
                    </div>
                    
                    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2d5a2d; margin-top: 0;">📁 Your Digital Photo</h3>
                        <p>Your high-quality digital photo is attached to this email and ready for download!</p>
                        <p><strong>File Name:</strong> {product_name.replace(' ', '_')}.jpg</p>
                        <p style="font-size: 14px; color: #666;">
                            💡 <strong>Tip:</strong> Save the attachment to your device for permanent access to your digital photo.
                        </p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
                        Thank you for your business! If you have any questions, feel free to contact us.
                    </p>
                </div>
            """
        }
        
        # Add image attachment if the product has a local image
        if product.get('image_url') and 'localhost' in product['image_url']:
            try:
                # Extract filename from URL
                image_filename = product['image_url'].split('/')[-1]
                image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
                
                if os.path.exists(image_path):
                    # Read and encode the image file
                    with open(image_path, 'rb') as img_file:
                        image_content = img_file.read()
                        image_base64 = base64.b64encode(image_content).decode('utf-8')
                    
                    # Determine MIME type
                    mime_type, _ = mimetypes.guess_type(image_path)
                    if not mime_type:
                        mime_type = 'application/octet-stream'
                    
                    # Add attachment to email
                    email_data['attachments'] = [{
                        'filename': f"{product_name.replace(' ', '_')}.{image_filename.split('.')[-1]}",
                        'content': image_base64,
                        'content_type': mime_type
                    }]
                    print(f"Adding image attachment: {image_filename}")
            except Exception as e:
                print(f"Error adding image attachment: {str(e)}")
        
        email_response = requests.post(resend_url, headers=headers, json=email_data)
        
        return jsonify({
            "message": "Payment confirmed and order created!",
            "order_id": str(order_result.inserted_id)
        }), 200
        
    except Exception as e:
        print(f"Error confirming payment: {str(e)}")
        return jsonify({"error": "Payment confirmation failed"}), 500

@app.route('/place_order', methods=['POST'])
def place_order():
    try:
        data = request.get_json()
        email = data.get('email')
        product_id = data.get('product_id')

        if not email or not product_id:
            return jsonify({"error": "Missing email or product_id"}), 400

        if not is_valid_email(email):
            return jsonify({"error": "Invalid email address"}), 400

        # Validate product exists
        product = mongo.db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Save order in DB
        order = {
            "email": email,
            "product_id": product_id,
            "product_name": product['name']
        }
        mongo.db.orders.insert_one(order)

        # Send confirmation email via Resend
        resend_url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {os.getenv('RESEND_API_KEY')}",
            "Content-Type": "application/json"
        }
        email_data = {
            "from": os.getenv("FROM_EMAIL"),
            "to": email,
            "subject": f"Order Confirmation for {product['name']}",
            "html": f"""
                <h3>Thank you for your order!</h3>
                <p>You have successfully purchased <strong>{product['name']}</strong> for ${product['price']}</p>
                <p>Description: {product['description']}</p>
                <p>Enjoy your new purchase!</p>
            """
        }

        response = requests.post(resend_url, headers=headers, json=email_data)

        if response.status_code not in (200, 201):
            print(f"Failed to send email: {response.text}")
            return jsonify({"error": "Order saved, but failed to send email"}), 500

        return jsonify({"message": "Order placed successfully! Check your email for confirmation."}), 200

    except Exception as e:
        print(f"Error placing order: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5003)
