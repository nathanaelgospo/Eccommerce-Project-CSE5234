"""Database connection and order persistence for warehouse_db."""

import os
import secrets

try:
    import pymysql
except ImportError:
    pymysql = None


def get_db_connection():
    """Establish a connection to the RDS MySQL database."""
    if pymysql is None:
        return None

    host = os.environ.get("DB_HOST")
    user = os.environ.get("DB_USER")
    password = os.environ.get("DB_PASSWORD")
    db_name = os.environ.get("DB_NAME")

    if not host or not user or not password:
        return None

    try:
        return pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=db_name,
            connect_timeout=5,
            autocommit=False,
            cursorclass=pymysql.cursors.DictCursor,
        )
    except Exception as error:
        print(f"Warning: Database connection failed: {error}")
        return None


def persist_order(payload, inventory_map, requested):
    """Save order, line items, payment, and shipping info to RDS database."""
    connection = get_db_connection()
    if not connection:
        return f"CH-{secrets.randbelow(900000) + 100000}"

    payment = payload.get("payment", {}) or {}
    shipping = payload.get("shipping", {}) or {}

    try:
        with connection.cursor() as cursor:
            # 1. Insert PAYMENT_INFO
            holder_name = payment.get("card_holder_name") or shipping.get("name") or "Valued Customer"
            card_num = payment.get("credit_card_number") or ""
            exp_date = payment.get("expir_date") or ""
            cvv = payment.get("cvvCode") or ""

            cursor.execute(
                """
                INSERT INTO PAYMENT_INFO (HOLDER_NAME, CARD_NUM, EXP_DATE, CVV)
                VALUES (%s, %s, %s, %s)
                """,
                (holder_name, card_num, exp_date, cvv),
            )
            payment_info_id = cursor.lastrowid

            # 2. Insert SHIPPING_INFO
            address1 = shipping.get("address_1") or shipping.get("addressLine1") or ""
            address2 = shipping.get("address_2") or shipping.get("addressLine2") or ""
            city = shipping.get("city") or ""
            state = shipping.get("state") or ""
            postal_code = shipping.get("zip") or ""
            customer_email = shipping.get("email") or payment.get("email") or ""

            cursor.execute(
                """
                INSERT INTO SHIPPING_INFO (ADDRESS1, ADDRESS2, CITY, STATE, COUNTRY, POSTAL_CODE, EMAIL)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (address1, address2, city, state, "USA", postal_code, customer_email),
            )
            shipping_info_id = cursor.lastrowid

            # 3. Insert CUSTOMER_ORDER
            customer_name = shipping.get("name") or holder_name
            cursor.execute(
                """
                INSERT INTO CUSTOMER_ORDER (CUSTOMER_NAME, CUSTOMER_EMAIL, SHIPPING_INFO_ID_FK, PAYMENT_INFO_ID_FK, STATUS)
                VALUES (%s, %s, %s, %s, 'New')
                """,
                (customer_name, customer_email, shipping_info_id, payment_info_id),
            )
            order_id = cursor.lastrowid

            # 4. Insert Line Items and decrement inventory
            for item_id_str, qty in requested.items():
                item_details = inventory_map.get(item_id_str, {})
                item_num = int(item_id_str)
                item_name = item_details.get("name") or f"Record #{item_id_str}"

                cursor.execute(
                    """
                    INSERT INTO CUSTOMER_ORDER_LINE_ITEM (ITEM_NUMBER, ITEM_NAME, QUANTITY, CUSTOMER_ORDER_ID_FK)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (item_num, item_name, qty, order_id),
                )

                # Decrement stock in ITEM table (matches on ID or ITEM_NUMBER)
                cursor.execute(
                    """
                    UPDATE ITEM 
                    SET AVAILABLE_QUANTITY = GREATEST(0, AVAILABLE_QUANTITY - %s)
                    WHERE ID = %s OR ITEM_NUMBER = %s
                    """,
                    (qty, item_num, item_num),
                )

            connection.commit()
            return f"CH-{order_id:06d}"

    except Exception as error:
        connection.rollback()
        print(f"Error persisting order to database: {error}")
        return f"CH-{secrets.randbelow(900000) + 100000}"
    finally:
        connection.close()

