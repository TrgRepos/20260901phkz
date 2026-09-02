# Lab 3: Refactoring in Small Steps

**Program:** Cursor AI-Powered Engineering Program, Session 2.2: Legacy System Modernization and AI-Driven TDD
**Duration:** 90 minutes
**Repo:** `routewise-ops`, `services/rate-engine`

---

## Objective

Flatten `calculate_shipment_rate`'s nested conditionals into small, named helper functions, one extraction at a time, running Lab 2's behavior-lock suite after every single change. By the end, the logic should be easier to read without a single number changing for a single input.

## Before You Start

- [ ] You completed Lab 2. `python -m pytest -v` is fully green and `behavior_lock_baseline.txt` exists as your saved reference.
- [ ] You watched the instructor's demo of this exact sequence (Demo D3).
- [ ] You understand this rule going in: **if a step ever makes the suite fail, stop and investigate before continuing.** Lab 4 covers this in depth; the short version is: capture the exact failure, don't guess at a fix, and don't edit the test to make it pass unless you can explain why the test itself was wrong.

---

## Background: What "Small Steps" Means Here

Every extraction below is its own Agent request, reviewed and tested on its own, before the next one starts. This is the same one-file, one-concern discipline from Level 1 and Level 2's earlier sessions, applied to refactoring instead of new-feature work. Bundling two extractions into one prompt makes it much harder to tell which one broke a test, if something breaks.

---

## Step 0: Save a Reference Copy Before You Start

Before making any changes, save a copy of the file exactly as it is right now. You'll use this at the end of the lab to confirm nothing but structure changed.

**macOS/Linux:**

```bash
cp services/rate-engine/rate_calculator.py services/rate-engine/rate_calculator_before_lab3.py.bak
```

**Windows (Command Prompt):**

```cmd
copy services\rate-engine\rate_calculator.py services\rate-engine\rate_calculator_before_lab3.py.bak
```

**Windows (PowerShell):**

```powershell
Copy-Item services\rate-engine\rate_calculator.py services\rate-engine\rate_calculator_before_lab3.py.bak
```

Keep this file until Step 6. It's a personal reference copy only, not something to import or run.

## Step 1: Extract the Region and Distance Charge

```
In services/rate-engine/rate_calculator.py, extract the region base rate
and distance band surcharge logic (the first big if/elif chain) into a
new private helper function called _region_distance_charge(region,
distance_km) that returns the computed total as a float. Update
calculate_shipment_rate to call it. Don't change any of the numbers or
thresholds, and don't touch any other part of the function.
```

Run the suite:

```bash
python -m pytest -v
```

Every test should still pass. If it does, review the diff: is `_region_distance_charge` a single function replacing five duplicated blocks, or did Agent just move the code without actually reducing the duplication? If the duplication is still there inside the new function, ask a follow-up specifically requesting a table-driven approach (a dictionary of region to base rate and distance bands) instead of a repeated if/elif chain.

## Step 2: Extract the Weight Surcharge

```
In services/rate-engine/rate_calculator.py, extract the weight-based
surcharge logic into a new private helper function called
_apply_weight_surcharge(total, weight_kg, is_oversized, is_fragile) that
returns the updated total. Update calculate_shipment_rate to call it.
Don't change any numbers or thresholds.
```

Run the suite again. Confirm every test still passes before moving on.

## Step 3: Extract the Date-Based Surcharges

```
In services/rate-engine/rate_calculator.py, extract the weekend/holiday
and expedited surcharge logic into a new private helper function called
_apply_date_surcharges(total, requested_date, is_expedited, is_oversized)
that returns the updated total, along with the is_holiday flag the rest
of the function still needs (the West-region special case depends on
it). This block also has its own internal oversized handling nested
inside the weekend and holiday branches, so is_oversized has to be
passed in too, not just the three values in the name. Return both
values as a tuple. Update calculate_shipment_rate to call it and unpack
both values. Don't change any numbers or thresholds.
```

Run the suite. This step is a good one to review closely: confirm the West+holiday+expedited special case later in the function still receives the correct `is_holiday` value, and confirm the nested oversized additions inside the weekend and holiday branches (the small `+8.00` and `+12.00` fees) still fire correctly now that `is_oversized` is passed in as a parameter instead of being read directly.

## Step 4: Extract the Tier Discount

```
In services/rate-engine/rate_calculator.py, extract the customer tier
discount logic into a new private helper function called
_apply_tier_discount(total, tier, is_oversized) that returns the updated
total. Update calculate_shipment_rate to call it. Preserve the rule that
oversized shipments never receive a discount exactly as it is now.
Don't change any numbers or thresholds.
```

Run the suite. Pay particular attention to the oversized-discount edge case test from Lab 2; this is the step most likely to accidentally change that specific behavior if the extraction isn't careful.

## Step 5: Add Type Hints

```
In services/rate-engine/rate_calculator.py, add type hints to
calculate_shipment_rate and all four helper functions created in this
lab: parameter types and explicit return types. Don't change any logic,
numbers, or thresholds; this step only adds annotations.
```

Run the suite one final time.

## Step 6: Review the Whole File as a Whole

Switch to **Ask mode**:

```
@services/rate-engine/rate_calculator.py
@services/rate-engine/rate_calculator_before_lab3.py.bak
Compare these two files. Confirm whether any numeric literal, threshold,
or comparison operator differs between them. List anything that changed
beyond function structure and naming. Do not modify any files.
```

Read the answer carefully; it should report no numeric differences at all, only structural ones (new helper functions, calls replacing inline logic, added type hints). If it flags any numeric change, stop and investigate before considering this lab done.

Then open `rate_calculator.py` yourself and read it top to bottom, confirming:

- `calculate_shipment_rate` itself is now much shorter, mostly a sequence of calls to the four new helpers.
- No numeric literal changed anywhere (compare a few key numbers, like the region base rates and the holiday surcharge percentage, against `rate_calculator_before_lab3.py.bak`).
- The two Lab 1 edge cases are still intact (you'll confirm this for certain when the suite passes, but it's worth restating in your own words here).

Once you're satisfied, delete `rate_calculator_before_lab3.py.bak`; it was a temporary reference copy only, not a file this repo keeps around.

## Guardrails

- **One extraction per Agent request.** Never bundle two of the steps above into a single message.
- **Run `python -m pytest -v` after every single step**, before starting the next one.
- **No numeric literal, threshold, or comparison operator changes.** If a diff changes a number, that's a behavior change, not a refactor, and should be rejected.
- **If a step breaks the suite, stop.** Don't proceed to the next extraction on top of a failing one.

## Definition of Done

- [ ] `_region_distance_charge`, `_apply_weight_surcharge`, `_apply_date_surcharges`, and `_apply_tier_discount` all exist as separate, named functions.
- [ ] `calculate_shipment_rate` itself is now primarily a sequence of calls to these helpers.
- [ ] Type hints are present on all five functions.
- [ ] `python -m pytest -v` is green after every individual step, not just at the end.
- [ ] No numeric literal in the file changed from its original value.
- [ ] Step 0's reference copy was used in Step 6's comparison, then deleted.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Step 1's extraction still has near-duplicate blocks per region | Agent moved the code without restructuring it | Ask explicitly for a dictionary-based lookup table instead of a repeated if/elif chain |
| A test fails after Step 3 specifically | The West+holiday special case later in the function may be reading a stale or incorrectly-unpacked `is_holiday` value | Check the return signature of `_apply_date_surcharges` and how it's unpacked at the call site |
| A test fails after Step 4, specifically the oversized-discount test | The extraction may have reordered the oversized check relative to the tier lookup | Compare the helper's logic line by line against the original block; the oversized check must still short-circuit before any discount percentage is applied |

## Looking Ahead

If any step above genuinely broke a test and you weren't sure why, that's exactly the situation Lab 4 is built around: capturing the exact failure and feeding it back to Agent in a disciplined way, instead of guessing.
