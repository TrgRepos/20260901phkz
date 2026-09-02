# rate-engine

The legacy shipment rate calculator for RouteWise Ops. Python, standalone,
no framework, talks to its own local SQLite file for customer pricing
tiers. This is the target for **Session 2.2: Legacy System Modernization
and AI-Driven TDD**.

## What's Here

| File | Purpose |
|---|---|
| `rate_calculator.py` | The legacy function itself: `calculate_shipment_rate`. Undocumented beyond the comments left in place, no tests, no type hints. |
| `db.py` | `get_customer_tier(customer_id)` - looks up a customer's pricing tier from `rates.db`. |
| `init_db.py` | Run once to (re)create `rates.db` with synthetic sample customers. |
| `requirements.txt` | `pytest` and `pytest-mock` - nothing else. Add nothing else without a reason. |
| `tests/` | Empty. Session 2.2, Lab 2 fills this in. |

## Getting Started

```bash
cd services/rate-engine
python -m pip install -r requirements.txt
python init_db.py
```

Use `python -m pip` rather than a bare `pip` command; it guarantees the install
target is the Python interpreter you're actually running, not a different one
earlier on your system's PATH. On Linux, if this fails with a message about an
externally-managed environment, retry with
`python -m pip install -r requirements.txt --break-system-packages`.

Confirm it runs:

```bash
python -c "from rate_calculator import calculate_shipment_rate; print(calculate_shipment_rate('RT-1', 'North', 8, 3, False, False, '2026-03-10', False, 'CUST-1001'))"
```

## Ground Rules for This Module

- **No behavior changes without a test proving the behavior first.** This function has driven real invoices for years; a silent change here is a silent change to what customers get charged.
- **No real customer data, ever.** `rates.db` is regenerated from `init_db.py`'s synthetic sample rows only.
- **Read `rate_calculator.py`'s header comment before changing anything.** It has the only record of *why* several of the stranger branches exist.
