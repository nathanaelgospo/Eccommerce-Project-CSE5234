"""
Local server for testing the Order Processing microservice.
Runs on http://localhost:5001/dev/order-processing/order
and directly executes the Lambda logic against the live RDS database.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import sys

# Add order_processing directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lambda_function

PORT = 5001

class OrderHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type,Authorization")
        self.send_header("Access-Control-Allow-Methods", "POST,OPTIONS")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")

        # Simulate API Gateway event
        event = {
            "httpMethod": "POST",
            "body": body,
            "headers": dict(self.headers),
        }

        response = lambda_function.lambda_handler(event, None)
        status_code = response.get("statusCode", 500)
        body_content = response.get("body", "{}")

        self._set_headers(status_code)
        self.wfile.write(body_content.encode("utf-8"))

    def log_message(self, format, *args):
        print(f"[Order-API] {args[0]} {args[1]}")


def run():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, OrderHandler)
    print(f"Order Processing local API running on http://localhost:{PORT}")
    httpd.serve_forever()


if __name__ == "__main__":
    run()

