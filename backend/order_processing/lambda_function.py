"""AWS Lambda handler entry point for POST /order-processing/order."""

import os
import sys

# Ensure root directory is importable
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.routes.order_routes import handle_create_order
from backend.services.inventory_service import InventoryService
from validators import response, parse_request_body


def _fetch_inventory():
    return InventoryService.get_all_albums()


def lambda_handler(event, _context):
    """Validate customer order against inventory and persist order in database."""
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod")
    )
    if method == "OPTIONS":
        return response(204, {})

    try:
        payload = parse_request_body(event)
    except ValueError as error:
        return response(400, {"error": str(error)})

    result, status_code = handle_create_order(payload, inventory_fetcher=_fetch_inventory)
    return response(status_code, result)
