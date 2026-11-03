"""AyoZon API: a small shop for digital photographs, paid with Stripe."""
import base64
import html
import json
import mimetypes
import os
import re
import secrets
import shutil
import uuid
from datetime import datetime, timezone
from functools import wraps

import requests
import stripe
from dotenv import load_dotenv
from flask import Flask, abort, jsonify, request, send_from_directory, session
from flask_cors import CORS
from werkzeug.utils import secure_filename

from store import open_store

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
SEED_DIR = os.path.join(BASE_DIR, "seed")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_UPLOAD_MB = 25

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_MB * 1024 * 1024
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In development the Vite dev server proxies /api and /uploads, so requests are
# same-origin. CORS only matters when the frontend is hosted elsewhere.
frontend_origins = [o.strip() for o in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",") if o.strip()]
CORS(app, supports_credentials=True, origins=frontend_origins)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
if not stripe.api_key or not STRIPE_PUBLISHABLE_KEY:
    raise ValueError("STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY must be set in .env")

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")

store = open_store(BASE_DIR)


# ---------- helpers ----------

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def is_valid_email(email):
    return bool(email) and re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email) is not None


def to_cents(price):
    return int(round(float(price) * 100))


def public_product(p):
    return {
        "id": p["id"],
        "name": p["name"],
        "description": p.get("description", ""),
        "price": p["price"],
        "credit": p.get("credit", ""),
        "image_url": f"/uploads/{p['image']}" if p.get("image") else p.get("image_url", ""),
        "created_at": p.get("created_at"),
    }


def public_order(o, with_token=False):
    out = {
        "id": o["id"],
        "email": o["email"],
        "items": o["items"],
        "total": o["total"],
        "status": o.get("status", "paid"),
        "created_at": o.get("created_at"),
        "email_sent": o.get("email_sent", False),
    }
    if with_token:
        out["token"] = o["token"]
    return out


def save_upload(file_storage):
    if not file_storage or not file_storage.filename:
        return None
    if not allowed_file(file_storage.filename):
        raise ValueError("Image must be PNG, JPG, GIF or WebP")
    filename = f"{uuid.uuid4().hex}_{secure_filename(file_storage.filename)}"
    file_storage.save(os.path.join(UPLOAD_FOLDER, filename))
    return filename


def remove_upload(filename):
    if not filename:
        return
    path = os.path.join(UPLOAD_FOLDER, os.path.basename(filename))
    if os.path.exists(path):
        os.remove(path)


def read_product_form():
    name = (request.form.get("name") or "").strip()
    description = (request.form.get("description") or "").strip()
    credit = (request.form.get("credit") or "").strip()
    try:
        price = round(float(request.form.get("price", "")), 2)
    except ValueError:
        raise ValueError("Price must be a number")
    if not name or not description:
        raise ValueError("Name and description are required")
    if price < 0.5:
        raise ValueError("Price must be at least $0.50 (Stripe's minimum)")
    return {"name": name, "description": description, "price": price, "credit": credit}


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get("is_admin"):
            return jsonify({"error": "Admin access required"}), 401
        return f(*args, **kwargs)
    return wrapper


def seed_demo_catalog():
    """Fill an empty store with the demo photographs so the shop is never blank."""
    if os.getenv("SEED_DEMO", "1") == "0" or store.list_products():
        return
    catalog_path = os.path.join(SEED_DIR, "catalog.json")
    if not os.path.exists(catalog_path):
        return
    with open(catalog_path) as f:
        catalog = json.load(f)
    for item in reversed(catalog):  # newest first in listings keeps catalog order
        src = os.path.join(SEED_DIR, "photos", item["file"])
        if not os.path.exists(src):
            continue
        filename = f"seed_{item['file']}"
        shutil.copyfile(src, os.path.join(UPLOAD_FOLDER, filename))
        store.add_product({
            "name": item["name"],
            "description": item["description"],
            "price": item["price"],
            "credit": item.get("credit", ""),
            "image": filename,
        })
    print(f"Seeded {len(catalog)} demo photographs")


seed_demo_catalog()


# ---------- public ----------

@app.get("/api/health")
def health():
    return {"ok": True, "storage": store.kind}


@app.get("/api/config")
def config():
    return {"publishable_key": STRIPE_PUBLISHABLE_KEY}


@app.get("/api/products")
def list_products():
    return jsonify([public_product(p) for p in store.list_products()])


@app.get("/api/products/<product_id>")
def get_product(product_id):
    p = store.get_product(product_id)
    if not p:
        return jsonify({"error": "Photo not found"}), 404
    return jsonify(public_product(p))


@app.get("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# ---------- checkout ----------

def resolve_items(product_ids):
    if not isinstance(product_ids, list) or not product_ids:
        raise ValueError("Your cart is empty")
    unique_ids = list(dict.fromkeys(str(i) for i in product_ids))  # each photo once
    products = []
    for pid in unique_ids:
        p = store.get_product(pid)
        if not p:
            raise LookupError("A photo in your cart is no longer available")
        products.append(p)
    return products


@app.post("/api/checkout/intent")
def create_intent():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    if not is_valid_email(email):
        return jsonify({"error": "Enter a valid email address"}), 400
    try:
        products = resolve_items(data.get("product_ids"))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except LookupError as e:
        return jsonify({"error": str(e)}), 404

    amount = sum(to_cents(p["price"]) for p in products)
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="usd",
            receipt_email=email,
            payment_method_types=["card"],
            metadata={
                "product_ids": ",".join(p["id"] for p in products),
                "customer_email": email,
            },
        )
    except stripe.StripeError as e:
        print(f"Stripe error: {e}")
        return jsonify({"error": "Could not start the payment. Try again in a moment."}), 502

    return jsonify({"client_secret": intent.client_secret, "amount": amount / 100})


def send_order_email(order, products):
    if not RESEND_API_KEY or not FROM_EMAIL:
        return False
    rows = "".join(
        f"<tr><td style='padding:6px 0'>{html.escape(p['name'])}</td>"
        f"<td style='padding:6px 0;text-align:right'>${p['price']:.2f}</td></tr>"
        for p in products
    )
    body = f"""
      <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c1c1c">
        <h2 style="font-weight:500">Thank you for your order</h2>
        <p>Your photographs are attached to this email at full resolution.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">{rows}
          <tr><td style="padding:12px 0 0;font-weight:600">Total</td>
          <td style="padding:12px 0 0;text-align:right;font-weight:600">${order['total']:.2f}</td></tr>
        </table>
        <p style="color:#666;font-size:14px">Order {html.escape(order['id'])}. Save the attachments to keep them.</p>
      </div>"""
    attachments = []
    for p in products:
        path = os.path.join(UPLOAD_FOLDER, p.get("image") or "")
        if p.get("image") and os.path.exists(path):
            with open(path, "rb") as f:
                content = base64.b64encode(f.read()).decode()
            ext = p["image"].rsplit(".", 1)[-1]
            attachments.append({
                "filename": f"{secure_filename(p['name'])}.{ext}",
                "content": content,
                "content_type": mimetypes.guess_type(path)[0] or "application/octet-stream",
            })
    try:
        r = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            json={
                "from": FROM_EMAIL,
                "to": order["email"],
                "subject": "Your AyoZon photographs",
                "html": body,
                "attachments": attachments,
            },
            timeout=20,
        )
        if r.status_code not in (200, 201):
            print(f"Email failed: {r.status_code} {r.text[:200]}")
        return r.status_code in (200, 201)
    except requests.RequestException as e:
        print(f"Email failed: {e}")
        return False


@app.post("/api/checkout/confirm")
def confirm_payment():
    data = request.get_json(silent=True) or {}
    intent_id = data.get("payment_intent_id")
    if not intent_id:
        return jsonify({"error": "Missing payment_intent_id"}), 400

    existing = store.find_order_by_intent(intent_id)
    if existing:  # a retry or a double click: return the same order
        return jsonify(public_order(existing, with_token=True))

    try:
        intent = stripe.PaymentIntent.retrieve(intent_id)
    except stripe.StripeError:
        return jsonify({"error": "Payment not found"}), 404
    if intent.status != "succeeded":
        return jsonify({"error": "Payment has not completed"}), 400

    ids = [i for i in intent.metadata.get("product_ids", "").split(",") if i]
    products = [p for p in (store.get_product(i) for i in ids) if p]
    order = store.add_order({
        "email": intent.metadata.get("customer_email"),
        "items": [
            {"product_id": p["id"], "name": p["name"], "price": p["price"],
             "image_url": f"/uploads/{p['image']}" if p.get("image") else ""}
            for p in products
        ],
        "total": intent.amount / 100,
        "payment_intent": intent_id,
        "status": "paid",
        "token": secrets.token_urlsafe(24),
        "email_sent": False,
    })
    sent = send_order_email(order, products)
    order["email_sent"] = sent
    return jsonify(public_order(order, with_token=True))


@app.get("/api/orders/<order_id>/download/<product_id>")
def download(order_id, product_id):
    order = store.get_order(order_id)
    token = request.args.get("token", "")
    if not order or not secrets.compare_digest(order.get("token", ""), token):
        abort(404)
    if product_id not in {i["product_id"] for i in order["items"]}:
        abort(404)
    p = store.get_product(product_id)
    if not p or not p.get("image"):
        abort(404)
    ext = p["image"].rsplit(".", 1)[-1]
    return send_from_directory(
        UPLOAD_FOLDER, p["image"], as_attachment=True,
        download_name=f"{secure_filename(p['name'])}.{ext}",
    )


# ---------- admin ----------

@app.post("/api/admin/login")
def admin_login():
    data = request.get_json(silent=True) or {}
    if (secrets.compare_digest(str(data.get("username", "")), ADMIN_USERNAME)
            and secrets.compare_digest(str(data.get("password", "")), ADMIN_PASSWORD)):
        session["is_admin"] = True
        return jsonify({"is_admin": True})
    return jsonify({"error": "That username and password don't match"}), 401


@app.post("/api/admin/logout")
def admin_logout():
    session.pop("is_admin", None)
    return jsonify({"is_admin": False})


@app.get("/api/admin/status")
def admin_status():
    return jsonify({"is_admin": bool(session.get("is_admin"))})


@app.get("/api/admin/overview")
@admin_required
def admin_overview():
    orders = store.list_orders()
    products = store.list_products()
    sales = {}
    for o in orders:
        for item in o["items"]:
            sales[item["product_id"]] = sales.get(item["product_id"], 0) + 1
    return jsonify({
        "revenue": round(sum(o["total"] for o in orders), 2),
        "order_count": len(orders),
        "product_count": len(products),
        "orders": [public_order(o) for o in orders[:50]],
        "sales_by_product": sales,
        "storage": store.kind,
    })


@app.post("/api/admin/products")
@admin_required
def add_product():
    try:
        fields = read_product_form()
        image = save_upload(request.files.get("image"))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if not image:
        return jsonify({"error": "Add a photograph"}), 400
    product = store.add_product({**fields, "image": image})
    return jsonify(public_product(product)), 201


@app.put("/api/admin/products/<product_id>")
@admin_required
def update_product(product_id):
    existing = store.get_product(product_id)
    if not existing:
        return jsonify({"error": "Photo not found"}), 404
    try:
        fields = read_product_form()
        image = save_upload(request.files.get("image"))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if image:
        remove_upload(existing.get("image"))
        fields["image"] = image
    product = store.update_product(product_id, fields)
    return jsonify(public_product(product))


@app.delete("/api/admin/products/<product_id>")
@admin_required
def delete_product(product_id):
    existing = store.get_product(product_id)
    if not existing:
        return jsonify({"error": "Photo not found"}), 404
    store.delete_product(product_id)
    remove_upload(existing.get("image"))
    return jsonify({"deleted": product_id})


@app.errorhandler(413)
def too_large(_):
    return jsonify({"error": f"Image is larger than {MAX_UPLOAD_MB} MB"}), 413


if __name__ == "__main__":
    app.run(debug=True, port=int(os.getenv("PORT", 5003)))
