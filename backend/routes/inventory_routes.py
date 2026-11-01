"""
Route handlers for inventory endpoints (GET /api/albums, GET /api/inventory).
"""

from backend.services.inventory_service import InventoryService


def handle_get_albums():
    """Handles GET /api/albums - Returns all albums with live remaining stock."""
    albums = InventoryService.get_all_albums()
    return albums, 200


def handle_get_album_by_id(item_id):
    """Handles GET /api/albums/:id - Returns a single album by ID."""
    album = InventoryService.get_album_by_id(item_id)
    if not album:
        return {"error": f"Album with ID {item_id} not found"}, 404
    return album, 200


def handle_get_album_by_name(name):
    """Handles GET /api/albums/search?name=... - Returns a single album by name."""
    album = InventoryService.get_album_by_name(name)
    if not album:
        return {"error": f"Album '{name}' not found"}, 404
    return album, 200

