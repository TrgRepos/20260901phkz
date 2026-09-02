import datetime

from db import get_customer_tier

# ---------------------------------------------------------------------
# rate_calculator.py
#
# Nobody currently on the team wrote the original version of this file.
# What follows is reconstructed from commit history and a few comments
# that were still readable:
#
#   - originally a ~40 line function, region and weight only
#   - weekend/holiday surcharge added after a dispute with a customer
#     about a Saturday delivery charge
#   - oversized/fragile handling bolted on over what looks like three
#     separate changes, never unified
#   - customer tier discount added when the loyalty program launched;
#     the "no discount on oversized" rule was a deliberate business
#     decision at the time, confirmed in an old email thread, not in
#     any code comment until now
#   - insurance surcharge added later still, seemingly copied from a
#     similar block in a different, now-deleted file
#
# None of this has unit tests. Changing behavior here has, in the past,
# changed real invoices without anyone intending it to. Read before you
# touch anything.
# ---------------------------------------------------------------------

HOLIDAYS = {
    "2026-01-01",
    "2026-05-25",
    "2026-07-04",
    "2026-09-07",
    "2026-11-26",
    "2026-12-25",
}

# high-value shipments over this amount get an insurance surcharge -
# the threshold has never changed since this was added
INSURANCE_THRESHOLD = 500.00


def calculate_shipment_rate(
    route_id,
    region,
    distance_km,
    weight_kg,
    is_fragile,
    is_oversized,
    requested_date,
    is_expedited,
    customer_id,
    insurance_value=0.0,
):
    if distance_km < 0:
        raise ValueError("distance_km cannot be negative")
    if weight_kg < 0:
        raise ValueError("weight_kg cannot be negative")
    if insurance_value < 0:
        raise ValueError("insurance_value cannot be negative")

    total = 0.0

    # ---- base rate + distance band surcharge, duplicated per region
    # ---- instead of looked up from a shared table, because at some
    # ---- point regional pricing needed to diverge in ways a shared
    # ---- table apparently couldn't express, and nobody went back to
    # ---- check if that was still true later
    if region == "North":
        total = total + (distance_km * 1.10)
        if distance_km <= 10:
            total = total + 0
        elif distance_km <= 25:
            total = total + 4.50
        elif distance_km <= 50:
            total = total + 9.00
        elif distance_km <= 100:
            total = total + 16.00
        else:
            total = total + 25.00
    elif region == "East":
        total = total + (distance_km * 1.25)
        if distance_km <= 10:
            total = total + 0
        elif distance_km <= 25:
            total = total + 5.00
        elif distance_km <= 50:
            total = total + 10.50
        elif distance_km <= 100:
            total = total + 18.50
        else:
            total = total + 28.00
    elif region == "South":
        total = total + (distance_km * 0.95)
        if distance_km <= 10:
            total = total + 0
        elif distance_km <= 25:
            total = total + 3.75
        elif distance_km <= 50:
            total = total + 7.50
        elif distance_km <= 100:
            total = total + 13.50
        else:
            total = total + 21.00
    elif region == "Central":
        total = total + (distance_km * 1.00)
        if distance_km <= 10:
            total = total + 0
        elif distance_km <= 25:
            total = total + 4.00
        elif distance_km <= 50:
            total = total + 8.00
        elif distance_km <= 100:
            total = total + 14.50
        else:
            total = total + 22.50
    elif region == "West":
        total = total + (distance_km * 1.30)
        if distance_km <= 10:
            total = total + 0
        elif distance_km <= 25:
            total = total + 5.25
        elif distance_km <= 50:
            total = total + 11.00
        elif distance_km <= 100:
            total = total + 19.50
        else:
            total = total + 29.50
    else:
        raise ValueError("Unknown region: " + str(region))

    # weight surcharge - this got messier every time someone added a
    # new edge case, nobody ever went back and cleaned it up. Each band
    # below repeats the same "check oversized, then check fragile"
    # pattern with slightly different numbers instead of calling a
    # shared helper, which is exactly the kind of duplication worth
    # extracting once behavior is locked in by tests.
    if weight_kg <= 5:
        if is_oversized:
            total = total + 6.00
        if is_fragile:
            total = total + (total * 0.05)
    elif weight_kg <= 15:
        total = total + 4.00
        if is_oversized:
            total = total + 9.00
        if is_fragile:
            total = total + (total * 0.07)
    elif weight_kg <= 30:
        total = total + 9.50
        if is_oversized:
            total = total + 14.00
        if is_fragile:
            total = total + (total * 0.08)
    else:
        total = total + 17.00
        if is_oversized:
            total = total + 22.00
        if is_fragile:
            total = total + (total * 0.10)

    # figure out if the requested date lands on a weekend or a holiday -
    # holidays win if both are somehow true, which basically never happens
    # but the check is written this way anyway. requested_date is expected
    # as an ISO "YYYY-MM-DD" string; nothing here validates the format
    # beyond what strptime itself enforces, so a malformed date raises
    # a ValueError from the standard library rather than from this
    # function's own validation at the top.
    is_weekend = False
    is_holiday = False
    if requested_date:
        parsed_date = datetime.datetime.strptime(requested_date, "%Y-%m-%d")
        weekday = parsed_date.weekday()
        if weekday == 5 or weekday == 6:
            is_weekend = True
        if requested_date in HOLIDAYS:
            is_holiday = True

    if is_holiday:
        total = total + (total * 0.20)
        if is_expedited:
            total = total + (total * 0.35)
            if is_oversized:
                total = total + 12.00
    elif is_weekend:
        total = total + (total * 0.12)
        if is_expedited:
            total = total + (total * 0.30)
            if is_oversized:
                total = total + 8.00
    else:
        if is_expedited:
            total = total + (total * 0.25)
            if is_oversized:
                total = total + 5.00

    # customer tier discount - oversized shipments never get a discount,
    # no matter what tier the customer is on, because a decision was made
    # about this at some point and nobody wrote it down anywhere except
    # here. This is exactly the kind of implicit business rule that
    # disappears if this function gets refactored without a test that
    # pins it down first - there's no comment anywhere else in the
    # codebase that says this is intentional.
    tier = get_customer_tier(customer_id)

    if is_oversized:
        pass
    else:
        if tier == "silver":
            total = total - (total * 0.05)
        elif tier == "gold":
            total = total - (total * 0.10)
        elif tier == "platinum":
            total = total - (total * 0.15)
        else:
            total = total

    # fragile items over 30kg get an extra handling fee on top of
    # everything above, applied after the discount, which is probably
    # a bug but changing it now would change everyone's invoices
    if is_fragile:
        if weight_kg > 30:
            total = total + 10.00

    # rush orders placed on a holiday and going to the West region get
    # a special additional fee, added at some point for reasons lost to
    # time - grep the commit history if you're curious, nobody else
    # who worked on this is still here to ask
    if is_expedited and is_holiday and region == "West":
        total = total + 15.00

    # insurance surcharge - only applies above the threshold, and only
    # if the shipment isn't already fragile, since fragile shipments
    # are assumed (incorrectly, probably) to already carry adequate
    # coverage through the fragile handling fee above
    if insurance_value and insurance_value > 0:
        if insurance_value >= INSURANCE_THRESHOLD:
            if is_fragile:
                pass
            else:
                if insurance_value >= 2000.00:
                    total = total + (insurance_value * 0.015)
                elif insurance_value >= 1000.00:
                    total = total + (insurance_value * 0.02)
                else:
                    total = total + (insurance_value * 0.025)

    if total < 15.00:
        total = 15.00

    return round(total, 2)


def _old_flat_rate_calculator(distance_km, weight_kg):
    """
    Deprecated. Kept around because deleting it once broke a script
    someone had cron-scheduled against this file directly. As far as
    anyone can tell nothing currently imports this. Confirm before
    removing it, don't just assume.
    """
    rate = distance_km * 1.0
    if weight_kg > 20:
        rate = rate + 10.0
    return round(rate, 2)
