"""HTTP and payload validation helpers for API Gateway requests."""

import json


def response(status_code, body):
    """Generate CORS-enabled API Gateway HTTP response."""
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


def parse_request_body(event):
    """Extract and validate JSON payload from the incoming event."""
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


def validate_quantities(payload):
    """Validate that order contains at least one item with positive integer quantities."""
    items = payload.get("items")
    if not isinstance(items, list) or not items:
        raise ValueError("Order must contain at least one item")

    quantities = {}
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("Items must be objects")
        item_id = item.get("id")
        quantity = item.get("quantity")
        if item_id is None:
            raise ValueError("Each item must have an id")
        if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity <= 0:
            raise ValueError("Each item quantity must be a positive integer")
        key = str(item_id)
        quantities[key] = quantities.get(key, 0) + quantity
    return quantities

