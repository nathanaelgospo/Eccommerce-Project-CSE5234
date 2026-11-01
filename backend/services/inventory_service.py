"""
Service layer for inventory management and album queries directly from RDS.
"""

from backend.database.db_connection import get_db_connection


def parse_album_description(description: str):
    """
    Parse the DESCRIPTION column from the ITEM table.
    Format in DB: 'Artist - Genre' (e.g. 'The Beatles - Rock', 'Pink Floyd - Progressive Rock')
    """
    if not description:
        return "Unknown Artist", "Vinyl"

    if " - " in description:
        parts = description.split(" - ", 1)
        return parts[0].strip(), parts[1].strip()

    return description.strip(), "Vinyl"


class InventoryService:
    @staticmethod
    def get_all_albums():
        """Fetch all album records and live warehouse stock directly from the ITEM table."""
        conn = get_db_connection()
        if not conn:
            print("[InventoryService] No DB connection available.")
            return []

        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT ID, ITEM_NUMBER, NAME, DESCRIPTION, AVAILABLE_QUANTITY, UNIT_PRICE, IMAGE_URL
                    FROM ITEM
                    ORDER BY ID ASC;
                    """
                )
                rows = cur.fetchall()

            albums = []
            for row in rows:
                album_id = row["ID"]
                album_name = row.get("NAME") or ""
                desc = row.get("DESCRIPTION") or ""
                subtitle, genre = parse_album_description(desc)

                albums.append({
                    "id": album_id,
                    "itemNumber": row.get("ITEM_NUMBER") or album_id,
                    "name": album_name,
                    "subtitle": subtitle,
                    "genre": genre,
                    "price": float(row.get("UNIT_PRICE") or 0.0),
                    "image": row.get("IMAGE_URL") or "/covers/abbey-road.jpg",
                    "stock": int(row.get("AVAILABLE_QUANTITY") or 0),
                })
            return albums
        except Exception as error:
            print(f"[InventoryService] Error querying ITEM table from DB: {error}")
            return []
        finally:
            conn.close()

    @staticmethod
    def get_album_by_id(item_id):
        """Fetch a single album by ID or ITEM_NUMBER directly from the database."""
        conn = get_db_connection()
        if not conn:
            return None
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT ID, ITEM_NUMBER, NAME, DESCRIPTION, AVAILABLE_QUANTITY, UNIT_PRICE, IMAGE_URL
                    FROM ITEM
                    WHERE ID = %s OR ITEM_NUMBER = %s
                    LIMIT 1;
                    """,
                    (item_id, item_id),
                )
                row = cur.fetchone()
            if not row:
                return None
            desc = row.get("DESCRIPTION") or ""
            subtitle, genre = parse_album_description(desc)
            return {
                "id": row["ID"],
                "itemNumber": row.get("ITEM_NUMBER") or row["ID"],
                "name": row.get("NAME") or "",
                "subtitle": subtitle,
                "genre": genre,
                "price": float(row.get("UNIT_PRICE") or 0.0),
                "image": row.get("IMAGE_URL") or "/covers/abbey-road.jpg",
                "stock": int(row.get("AVAILABLE_QUANTITY") or 0),
            }
        except Exception as error:
            print(f"[InventoryService] Error querying item by ID: {error}")
            return None
        finally:
            conn.close()

    @staticmethod
    def get_album_by_name(name):
        """Fetch a single album by name (case-insensitive) directly from the database."""
        conn = get_db_connection()
        if not conn:
            return None
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT ID, ITEM_NUMBER, NAME, DESCRIPTION, AVAILABLE_QUANTITY, UNIT_PRICE, IMAGE_URL
                    FROM ITEM
                    WHERE LOWER(NAME) = LOWER(%s) OR LOWER(NAME) LIKE LOWER(%s)
                    LIMIT 1;
                    """,
                    (name, f"%{name}%"),
                )
                row = cur.fetchone()
            if not row:
                return None
            desc = row.get("DESCRIPTION") or ""
            subtitle, genre = parse_album_description(desc)
            return {
                "id": row["ID"],
                "itemNumber": row.get("ITEM_NUMBER") or row["ID"],
                "name": row.get("NAME") or "",
                "subtitle": subtitle,
                "genre": genre,
                "price": float(row.get("UNIT_PRICE") or 0.0),
                "image": row.get("IMAGE_URL") or "/covers/abbey-road.jpg",
                "stock": int(row.get("AVAILABLE_QUANTITY") or 0),
            }
        except Exception as error:
            print(f"[InventoryService] Error querying item by name: {error}")
            return None
        finally:
            conn.close()

    @staticmethod
    def get_album_stock_map():
        """Return a mapping of str(id) -> available stock."""
        albums = InventoryService.get_all_albums()
        return {str(a["id"]): a["stock"] for a in albums}, {str(a["id"]): a for a in albums}

