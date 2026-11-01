"""Inventory microservice client and stock verification."""

import json
import os
import urllib.error
import urllib.request


def fetch_inventory():
    """Fetch current inventory catalog and stock from the inventory service."""
    api_url = os.environ.get(
        "INVENTORY_API_URL",
        "https://e6aq1plbmj.execute-api.us-east-2.amazonaws.com/dev/inventory-management/inventory"
    )
    if not api_url:
        raise RuntimeError("INVENTORY_API_URL environment variable is not set")

    request = urllib.request.Request(
        api_url,
        headers={"Accept": "application/json"},
        method="GET",
    )
    with urllib.request.urlopen(request, timeout=5) as response:
        inventory = json.loads(response.read().decode("utf-8"))
    if not isinstance(inventory, list):
        raise RuntimeError("Inventory service returned an invalid response")
    return inventory


def check_stock_availability(inventory, requested):
    """
    Check requested quantities against stock.
    Returns (is_available, unavailable_items, inventory_map).
    """
    available = {
        str(product.get("id")): product.get("stock", 0)
        for product in inventory
        if isinstance(product, dict) and product.get("id") is not None
    }
    inventory_map = {
        str(product.get("id")): product
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

    return len(insufficient) == 0, insufficient, inventory_map

