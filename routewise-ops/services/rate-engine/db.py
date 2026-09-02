"""
db.py

Thin data-access layer for the rate engine. Nobody remembers exactly why
this talks to its own local SQLite file instead of the main API's data,
but it's been that way since before this repo used TypeScript at all.

Do not add new callers of this module without checking with the ops
team first - the customers table is hand-maintained.
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "rates.db"


def get_customer_tier(customer_id):
    """
    Returns the pricing tier for a customer: 'standard', 'silver',
    'gold', or 'platinum'. Falls back to 'standard' if the customer
    isn't found, or if anything about the lookup goes wrong.
    """
    if not customer_id:
        return "standard"

    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT tier FROM customers WHERE customer_id = ?", (customer_id,)
        )
        row = cur.fetchone()
        if row is None:
            return "standard"
        return row[0]
    except sqlite3.Error:
        return "standard"
    finally:
        conn.close()
