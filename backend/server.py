"""
Main REST API Server dispatching to Route and Service layers.
Routes:
- GET  /api/albums                 -> get albums with live stock
- POST /api/orders                 -> create customer order in RDS
- POST /order-processing/order     -> AWS backward-compatibility endpoint
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from urllib.parse import urlparse, parse_qs
from backend.routes.inventory_routes import (
    handle_get_albums,
    handle_get_album_by_id,
    handle_get_album_by_name,
)
from backend.routes.order_routes import handle_create_order

PORT = 5001


class RestApiRouter(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type,Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        query = parse_qs(parsed.query)

        # GET all albums
        if path in ("/api/albums", "/api/inventory", "/dev/inventory-management/inventory"):
            data, status = handle_get_albums()
            self._set_headers(status)
            self.wfile.write(json.dumps(data).encode("utf-8"))

        # GET by name: /api/albums/search?name=Abbey+Road
        elif path == "/api/albums/search" and "name" in query:
            name = query["name"][0]
            data, status = handle_get_album_by_name(name)
            self._set_headers(status)
            self.wfile.write(json.dumps(data).encode("utf-8"))

        # GET by ID: /api/albums/1 or /api/albums/1001
        elif path.startswith("/api/albums/"):
            item_id = path.replace("/api/albums/", "")
            data, status = handle_get_album_by_id(item_id)
            self._set_headers(status)
            self.wfile.write(json.dumps(data).encode("utf-8"))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": f"Endpoint not found: {path}"}).encode("utf-8"))

    def do_POST(self):
        path = self.path.split("?")[0].rstrip("/")

        content_length = int(self.headers.get("Content-Length", 0))
        body_raw = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"

        try:
            payload = json.loads(body_raw)
        except json.JSONDecodeError:
            self._set_headers(400)
            self.wfile.write(json.dumps({"error": "Invalid JSON payload"}).encode("utf-8"))
            return

        if path in ("/api/orders", "/order-processing/order", "/dev/order-processing/order"):
            data, status = handle_create_order(payload)
            self._set_headers(status)
            self.wfile.write(json.dumps(data).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": f"Endpoint not found: {path}"}).encode("utf-8"))

    def log_message(self, format, *args):
        print(f"[API] {args[0]} {args[1]}")


def run():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, RestApiRouter)
    print("=" * 60)
    print(f" Groove REST API server running on http://localhost:{PORT}")
    print(f"   GET  http://localhost:{PORT}/api/albums  (Live RDS Inventory)")
    print(f"   POST http://localhost:{PORT}/api/orders  (Orders & RDS DB)")
    print("=" * 60)
    httpd.serve_forever()


if __name__ == "__main__":
    run()

