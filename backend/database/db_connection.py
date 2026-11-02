"""
Database connection factory and pool configuration for AWS RDS MySQL.
"""

import os

try:
    import pymysql
except ImportError:
    pymysql = None


def _load_dotenv_if_exists():
    """Simple parser to load .env / .env.local if not already in os.environ."""
    env_paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", ".env.local"),
        os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
    ]
    for env_path in env_paths:
        if os.path.isfile(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k, v = k.strip(), v.strip().strip('"').strip("'")
                            if k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass


def get_db_connection():
    """Establish and return an active MySQL connection to RDS warehouse_db."""
    if pymysql is None:
        return None

    _load_dotenv_if_exists()

    host = os.environ.get("DB_HOST")
    user = os.environ.get("DB_USER")
    password = os.environ.get("DB_PASSWORD")
    db_name = os.environ.get("DB_NAME")

    if not host or not user or not password or not db_name:
        print("[DB] Missing database connection credentials. Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in your .env.local file.")
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
        print(f"[DB] Connection failed: {error}")
        return None

