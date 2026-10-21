import json
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent))
import lambda_function


class OrderProcessingTests(unittest.TestCase):
    def setUp(self):
        self.payload = {
            "items": [{"id": 1, "quantity": 2}],
            "payment": {"credit_card_number": "4111111111111111"},
            "shipping": {"name": "Alex Example"},
        }

    def invoke(self, payload=None):
        return lambda_function.lambda_handler(
            {"body": json.dumps(payload if payload is not None else self.payload)},
            None,
        )

    @patch.dict(os.environ, {"INVENTORY_API_URL": "https://inventory.example/items"})
    @patch("lambda_function._fetch_inventory", return_value=[{"id": 1, "stock": 4}])
    def test_accepts_order_and_returns_confirmation_number(self, _inventory):
        response = self.invoke()
        body = json.loads(response["body"])
        self.assertEqual(response["statusCode"], 200)
        self.assertRegex(body["confirmationNumber"], r"^CH-\d{6}$")

    @patch.dict(os.environ, {"INVENTORY_API_URL": "https://inventory.example/items"})
    @patch("lambda_function._fetch_inventory", return_value=[{"id": 1, "stock": 1}])
    def test_rejects_order_when_stock_is_insufficient(self, _inventory):
        response = self.invoke()
        self.assertEqual(response["statusCode"], 409)
        self.assertEqual(json.loads(response["body"])["unavailableItems"], [
            {"id": "1", "requested": 2, "available": 1}
        ])

    def test_rejects_malformed_order_without_calling_inventory(self):
        with patch("lambda_function._fetch_inventory") as fetch_inventory:
            response = self.invoke({"items": [{"id": 1, "quantity": 0}]})
        self.assertEqual(response["statusCode"], 400)
        fetch_inventory.assert_not_called()

    @patch.dict(os.environ, {"INVENTORY_API_URL": "https://inventory.example/items"})
    @patch("lambda_function._fetch_inventory", side_effect=TimeoutError("timeout"))
    def test_reports_inventory_service_failure(self, _inventory):
        response = self.invoke()
        self.assertEqual(response["statusCode"], 502)
        self.assertIn("unavailable", json.loads(response["body"])["error"])


if __name__ == "__main__":
    unittest.main()
