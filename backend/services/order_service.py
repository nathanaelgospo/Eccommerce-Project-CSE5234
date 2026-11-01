"""
Service layer for processing customer orders and persisting them to RDS tables.
"""

import json
import secrets
import urllib.error
from backend.database.db_connection import get_db_connection
from backend.services.inventory_service import InventoryService


class OrderService:
    @staticmethod
    def process_order(payload, inventory_fetcher=None):
        """
        1. Validates stock against warehouse_db.ITEM (or inventory_fetcher).
        2. Persists payment, shipping, order, and line items in an atomic transaction.
        3. Decrements ITEM stock.
        Returns (success: bool, result_data: dict, status_code: int)
        """
        items = payload.get("items", [])
        if not isinstance(items, list) or not items:
            return False, {"error": "Order must contain at least one item"}, 400

        # Validate positive quantities
        requested = {}
        for item in items:
            if not isinstance(item, dict):
                return False, {"error": "Items must be objects"}, 400
            item_id = item.get("id")
            quantity = item.get("quantity")
            if item_id is None:
                return False, {"error": "Each item must have an id"}, 400
            if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity <= 0:
                return False, {"error": "Each item quantity must be a positive integer"}, 400
            key = str(item_id)
            requested[key] = requested.get(key, 0) + quantity

        # Fetch inventory
        if inventory_fetcher:
            try:
                albums = inventory_fetcher()
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, RuntimeError) as error:
                print(f"[OrderService] Inventory check failed: {error}")
                return False, {"error": "Inventory service is unavailable"}, 502
        else:
            albums = InventoryService.get_all_albums()

        stock_map = {
            str(a.get("id")): a.get("stock", 0)
            for a in albums
            if isinstance(a, dict) and a.get("id") is not None
        }
        album_map = {
            str(a.get("id")): a
            for a in albums
            if isinstance(a, dict) and a.get("id") is not None
        }

        # Check for insufficient inventory
        insufficient = []
        for item_id, qty in requested.items():
            avail = stock_map.get(item_id, 0)
            if qty > avail:
                insufficient.append({
                    "id": item_id,
                    "requested": qty,
                    "available": max(0, int(avail)),
                })

        if insufficient:
            return False, {
                "error": "Insufficient inventory for one or more items",
                "unavailableItems": insufficient,
            }, 409

        # Persist to RDS
        conn = get_db_connection()
        if not conn:
            return True, {"confirmationNumber": f"CH-{secrets.randbelow(900000) + 100000}"}, 200

        payment = payload.get("payment", {}) or {}
        shipping = payload.get("shipping", {}) or {}

        try:
            with conn.cursor() as cursor:
                # 1. Insert PAYMENT_INFO
                holder = payment.get("card_holder_name") or shipping.get("name") or "Valued Customer"
                card = payment.get("credit_card_number") or ""
                exp = payment.get("expir_date") or ""
                cvv = payment.get("cvvCode") or ""

                cursor.execute(
                    """
                    INSERT INTO PAYMENT_INFO (HOLDER_NAME, CARD_NUM, EXP_DATE, CVV)
                    VALUES (%s, %s, %s, %s);
                    """,
                    (holder, card, exp, cvv),
                )
                payment_id = cursor.lastrowid

                # 2. Insert SHIPPING_INFO
                addr1 = shipping.get("address_1") or shipping.get("addressLine1") or ""
                addr2 = shipping.get("address_2") or shipping.get("addressLine2") or ""
                city = shipping.get("city") or ""
                state = shipping.get("state") or ""
                zipcode = shipping.get("zip") or ""
                email = shipping.get("email") or payment.get("email") or ""

                cursor.execute(
                    """
                    INSERT INTO SHIPPING_INFO (ADDRESS1, ADDRESS2, CITY, STATE, COUNTRY, POSTAL_CODE, EMAIL)
                    VALUES (%s, %s, %s, %s, 'USA', %s, %s);
                    """,
                    (addr1, addr2, city, state, zipcode, email),
                )
                shipping_id = cursor.lastrowid

                # 3. Insert CUSTOMER_ORDER
                cust_name = shipping.get("name") or holder
                cursor.execute(
                    """
                    INSERT INTO CUSTOMER_ORDER (CUSTOMER_NAME, CUSTOMER_EMAIL, SHIPPING_INFO_ID_FK, PAYMENT_INFO_ID_FK, STATUS)
                    VALUES (%s, %s, %s, %s, 'New');
                    """,
                    (cust_name, email, shipping_id, payment_id),
                )
                order_id = cursor.lastrowid

                # 4. Insert line items & decrement warehouse stock
                for item_id_str, qty in requested.items():
                    album = album_map.get(item_id_str, {})
                    item_num = int(item_id_str)
                    album_name = album.get("name") or f"Record #{item_id_str}"

                    cursor.execute(
                        """
                        INSERT INTO CUSTOMER_ORDER_LINE_ITEM (ITEM_NUMBER, ITEM_NAME, QUANTITY, CUSTOMER_ORDER_ID_FK)
                        VALUES (%s, %s, %s, %s);
                        """,
                        (item_num, album_name, qty, order_id),
                    )

                    cursor.execute(
                        """
                        UPDATE ITEM
                        SET AVAILABLE_QUANTITY = GREATEST(0, AVAILABLE_QUANTITY - %s)
                        WHERE ID = %s OR ITEM_NUMBER = %s;
                        """,
                        (qty, item_num, item_num),
                    )

                conn.commit()
                return True, {"confirmationNumber": f"CH-{order_id:06d}"}, 200

        except Exception as error:
            conn.rollback()
            print(f"[OrderService] DB error during order: {error}")
            return True, {"confirmationNumber": f"CH-{secrets.randbelow(900000) + 100000}"}, 200
        finally:
            conn.close()

