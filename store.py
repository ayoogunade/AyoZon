"""Storage for products and orders.

Uses MongoDB when MONGO_URI is set and reachable, otherwise a JSON file at
data/store.json, so the demo runs with no database to set up.
"""
import json
import os
import threading
import uuid
from datetime import datetime, timezone


def now_iso():
    return datetime.now(timezone.utc).isoformat()


class JsonStore:
    kind = "json"

    def __init__(self, path):
        self.path = path
        self.lock = threading.Lock()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        if not os.path.exists(path):
            self._write({"products": [], "orders": []})

    def _read(self):
        with open(self.path) as f:
            return json.load(f)

    def _write(self, data):
        tmp = self.path + ".tmp"
        with open(tmp, "w") as f:
            json.dump(data, f, indent=2)
        os.replace(tmp, self.path)

    # Products
    def list_products(self):
        products = self._read()["products"]
        return sorted(products, key=lambda p: p.get("created_at", ""), reverse=True)

    def get_product(self, product_id):
        return next((p for p in self._read()["products"] if p["id"] == product_id), None)

    def add_product(self, fields):
        with self.lock:
            data = self._read()
            product = {"id": uuid.uuid4().hex[:24], "created_at": now_iso(), **fields}
            data["products"].append(product)
            self._write(data)
            return product

    def update_product(self, product_id, fields):
        with self.lock:
            data = self._read()
            for p in data["products"]:
                if p["id"] == product_id:
                    p.update(fields)
                    self._write(data)
                    return p
            return None

    def delete_product(self, product_id):
        with self.lock:
            data = self._read()
            before = len(data["products"])
            data["products"] = [p for p in data["products"] if p["id"] != product_id]
            self._write(data)
            return len(data["products"]) < before

    # Orders
    def list_orders(self):
        orders = self._read()["orders"]
        return sorted(orders, key=lambda o: o.get("created_at", ""), reverse=True)

    def get_order(self, order_id):
        return next((o for o in self._read()["orders"] if o["id"] == order_id), None)

    def find_order_by_intent(self, intent_id):
        return next((o for o in self._read()["orders"] if o.get("payment_intent") == intent_id), None)

    def add_order(self, fields):
        with self.lock:
            data = self._read()
            order = {"id": uuid.uuid4().hex[:24], "created_at": now_iso(), **fields}
            data["orders"].append(order)
            self._write(data)
            return order


class MongoStore:
    kind = "mongo"

    def __init__(self, uri):
        from pymongo import MongoClient

        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        db = client.get_default_database(default="amazon_clone")
        self.products = db.products
        self.orders = db.orders

    @staticmethod
    def _out(doc):
        if doc is None:
            return None
        doc = dict(doc)
        doc["id"] = str(doc.pop("_id"))
        return doc

    @staticmethod
    def _oid(value):
        from bson.objectid import ObjectId
        from bson.errors import InvalidId

        try:
            return ObjectId(value)
        except (InvalidId, TypeError):
            return None

    def list_products(self):
        return [self._out(d) for d in self.products.find().sort("created_at", -1)]

    def get_product(self, product_id):
        oid = self._oid(product_id)
        return self._out(self.products.find_one({"_id": oid})) if oid else None

    def add_product(self, fields):
        doc = {"created_at": now_iso(), **fields}
        result = self.products.insert_one(doc)
        return self.get_product(str(result.inserted_id))

    def update_product(self, product_id, fields):
        oid = self._oid(product_id)
        if not oid or not self.products.find_one({"_id": oid}):
            return None
        self.products.update_one({"_id": oid}, {"$set": fields})
        return self.get_product(product_id)

    def delete_product(self, product_id):
        oid = self._oid(product_id)
        return bool(oid) and self.products.delete_one({"_id": oid}).deleted_count > 0

    def list_orders(self):
        return [self._out(d) for d in self.orders.find().sort("created_at", -1)]

    def get_order(self, order_id):
        oid = self._oid(order_id)
        return self._out(self.orders.find_one({"_id": oid})) if oid else None

    def find_order_by_intent(self, intent_id):
        return self._out(self.orders.find_one({"payment_intent": intent_id}))

    def add_order(self, fields):
        doc = {"created_at": now_iso(), **fields}
        result = self.orders.insert_one(doc)
        return self.get_order(str(result.inserted_id))


def open_store(base_dir):
    uri = os.getenv("MONGO_URI")
    if uri:
        try:
            store = MongoStore(uri)
            print("Storage: MongoDB")
            return store
        except Exception as e:  # unreachable cluster, bad URI, DNS failure
            print(f"Storage: MongoDB unavailable ({type(e).__name__}), using data/store.json")
    else:
        print("Storage: no MONGO_URI, using data/store.json")
    return JsonStore(os.path.join(base_dir, "data", "store.json"))
