"""Order processing Lambda used by POST /order-processing/order."""

import json
import os
import secrets
import urllib.error
import urllib.request


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        "body": json.dumps(body),
    }


def _request_body(event):
    body = event.get("body")
    if isinstance(body, dict):
        return body
    if not isinstance(body, str):
        raise ValueError("Request body must be a JSON object")
    try:
        payload = json.loads(body)
    except json.JSONDecodeError as error:
        raise ValueError("Request body must contain valid JSON") from error
    if not isinstance(payload, dict):
        raise ValueError("Request body must be a JSON object")
    return payload


def _validated_quantities(payload):
    items = payload.get("items")
    if not isinstance(items, list) or not items:
        raise ValueError("Order must contain at least one item")

    quantities = {}
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("Each item must be an object")
        item_id = item.get("id")
        quantity = item.get("quantity")
        if item_id is None or isinstance(item_id, (dict, list)):
            raise ValueError("Each item must include an id")
        if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
            raise ValueError("Each item quantity must be a positive integer")
        key = str(item_id)
        quantities[key] = quantities.get(key, 0) + quantity

    for section in ("payment", "shipping"):
        if not isinstance(payload.get(section), dict):
            raise ValueError(f"Order must include {section} details")
    return quantities


def _fetch_inventory():
    inventory_url = os.environ.get("INVENTORY_API_URL")
    if not inventory_url:
        raise RuntimeError("INVENTORY_API_URL is not configured")

    request = urllib.request.Request(
        inventory_url,
        headers={"Accept": "application/json"},
        method="GET",
    )
    with urllib.request.urlopen(request, timeout=5) as response:
        inventory = json.loads(response.read().decode("utf-8"))
    if not isinstance(inventory, list):
        raise RuntimeError("Inventory service returned an invalid response")
    return inventory


def lambda_handler(event, _context):
    """Validate a customer order against live inventory and issue a receipt ID."""
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod")
    )
    if method == "OPTIONS":
        return _response(204, {})

    try:
        payload = _request_body(event)
        requested = _validated_quantities(payload)
    except ValueError as error:
        return _response(400, {"error": str(error)})

    try:
        inventory = _fetch_inventory()
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, RuntimeError) as error:
        print(f"Inventory check failed: {error}")
        return _response(502, {"error": "Inventory service is unavailable"})

    available = {
        str(product.get("id")): product.get("stock", 0)
        for product in inventory
        if isinstance(product, dict) and product.get("id") is not None
    }
    insufficient = []
    for item_id, quantity in requested.items():
        stock = available.get(item_id, 0)
        if isinstance(stock, bool) or not isinstance(stock, (int, float)):
            stock = 0
        if quantity > stock:
            insufficient.append({
                "id": item_id,
                "requested": quantity,
                "available": max(0, int(stock)),
            })

    if insufficient:
        return _response(
            409,
            {
                "error": "Insufficient inventory for one or more items",
                "unavailableItems": insufficient,
            },
        )

    return _response(200, {"confirmationNumber": f"CH-{secrets.randbelow(900000) + 100000}"})
