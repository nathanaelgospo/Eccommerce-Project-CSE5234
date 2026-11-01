"""
Route handlers for order endpoints (POST /api/orders, POST /order-processing/order).
"""

from backend.services.order_service import OrderService


def handle_create_order(payload, inventory_fetcher=None):
    """
    Handles POST /api/orders
    Validates items, checks inventory, and records order in warehouse_db.
    """
    success, result, status_code = OrderService.process_order(payload, inventory_fetcher=inventory_fetcher)
    return result, status_code

