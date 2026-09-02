"""
init_db.py

Run this once to (re)create rates.db with synthetic sample customers.
Never point this at real customer data.

    python init_db.py
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "rates.db"

SAMPLE_CUSTOMERS = [
    ("CUST-1001", "standard"),
    ("CUST-1002", "silver"),
    ("CUST-1003", "gold"),
    ("CUST-1004", "platinum"),
    ("CUST-1005", "standard"),
    ("CUST-1006", "gold"),
    ("CUST-1007", "silver"),
    ("CUST-1008", "platinum"),
]


def main():
    if DB_PATH.exists():
        DB_PATH.unlink()

    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            """
            CREATE TABLE customers (
                customer_id TEXT PRIMARY KEY,
                tier TEXT NOT NULL
            )
            """
        )
        conn.executemany(
            "INSERT INTO customers (customer_id, tier) VALUES (?, ?)",
            SAMPLE_CUSTOMERS,
        )
        conn.commit()
        print(f"Created {DB_PATH} with {len(SAMPLE_CUSTOMERS)} synthetic customers.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
