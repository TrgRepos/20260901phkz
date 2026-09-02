# Lab 4: Test-Driven Repair Loop

**Program:** Cursor AI-Powered Engineering Program, Session 2.2: Legacy System Modernization and AI-Driven TDD
**Duration:** 60 minutes
**Repo:** `routewise-ops`, `services/rate-engine`

---

## Objective

Practice the exact discipline that makes refactoring under a behavior lock safe: when a test fails, capture the **exact** terminal output, ask for the root cause before any fix, then request a fix scoped to exactly the file and function involved. Never guess, never say "fix everything."

## Before You Start

- [ ] You completed Lab 3. `python -m pytest -v` is green and all five refactored functions exist.
- [ ] You watched the instructor's live debugging demo immediately before this lab (Demo D4).

---

## If Your Lab 3 Suite Is Already Green (It Should Be)

Seed this exact, verified defect so you have something real to repair. In `services/rate-engine/rate_calculator.py`, find this line inside `_apply_weight_surcharge`, in the 15kg-to-30kg band:

```python
    elif weight_kg <= 30:
        total = total + 9.50
        if is_oversized:
            total = total + 14.00
        if is_fragile:
            total = total + (total * 0.08)
```

Change the last line to:

```python
    elif weight_kg <= 30:
        total = total + 9.50
        if is_oversized:
            total = total + 14.00
        if is_fragile:
            total = total + (9.50 * 0.08)
```

That's the only change: the fragile surcharge now applies to the flat 9.50 weight fee instead of the running total, which silently undercharges every fragile shipment in this weight band that also has a region and distance charge on it (which is all of them).

Run the suite once to confirm it now fails before continuing:

```bash
python -m pytest -v
```

If every test still passes after this change, stop here and go back to Lab 2 before continuing. It means your test suite doesn't have a test combining `is_fragile=True` with a weight in the 15-to-30kg band specifically; a test that only checks weight bands with `is_fragile=False`, and only checks `is_fragile=True` at the default light-shipment weight, will never exercise this exact line. Add that test now, following Lab 2 Step 2's instruction to cover each weight band with `is_fragile=True`, confirm it fails with this bug in place, then come back to this step.

## Step 1: Capture the Exact Failure Output

```bash
python -m pytest -v
```

You should see one test fail, something like this (this was captured from a real run, yours should match in shape even if the test name differs):

```
FAILED tests/test_rate_calculator.py::test_fragile_shipment_15_to_30kg_band - assert 74.52 == 78.03
```

Get the full failure detail, not just the one-line summary:

```bash
python -m pytest -v tests/test_rate_calculator.py::test_fragile_shipment_15_to_30kg_band
```

Copy the exact output, the real one from your own terminal, not the line above. That's what goes into Step 2.

## Step 2: Ask for Root Cause First

Switch to **Agent mode** (or Debug mode, if your instructor's demo used Debug mode for this step) and send:

```
This test is failing with the output below. Find the root cause in
_apply_weight_surcharge before proposing anything.

<paste the exact pytest output from Step 1 here>
```

A correct root-cause answer will point specifically at the fragile-surcharge line in the 15-to-30kg band, and explain that it's now computing 8% of the flat 9.50 fee instead of 8% of the running total, not just "the fragile calculation is wrong."

## Step 3: Request a Scoped Fix

Once the root cause is confirmed, send:

```
Propose a fix limited to _apply_weight_surcharge in
services/rate-engine/rate_calculator.py. Don't touch any other function.
```

The correct fix reverts the line to:

```python
        if is_fragile:
            total = total + (total * 0.08)
```

Review the diff. Confirm it touches only `_apply_weight_surcharge`, and only that one line.

## Step 4: Apply and Re-Run

```bash
python -m pytest -v
```

You should be back to every test passing. If it's still red, paste the **new** failure output and repeat from Step 2. Don't guess at a second fix without new evidence.

## Guardrails

- **Never say "fix everything."** Point at the one specific failing test.
- **Paste the exact failure text**, verbatim, never paraphrased or summarized in your own words.
- **Always ask for root cause before a fix**, exactly as demonstrated.
- **If still red after a fix, paste the new failure and repeat.** Don't guess at a second fix without new evidence.

## Definition of Done

- [ ] You identified (or seeded) one failing test and captured its exact output.
- [ ] The root-cause explanation preceded any proposed fix, and correctly named the flat-fee-instead-of-running-total mistake.
- [ ] The fix was scoped to `_apply_weight_surcharge` only.
- [ ] `python -m pytest -v` shows every test passing again, and you can explain why the original failure happened.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| All tests still pass after seeding the defect | Either the edit didn't save or hit the wrong weight band, or your Lab 2 suite has no test combining `is_fragile=True` with a weight in the 15-to-30kg band | First confirm the 15-to-30kg band specifically contains `(9.50 * 0.08)` rather than `(total * 0.08)`; if it does and tests still pass, go back to Lab 2 and add the missing fragile-per-band test |
| The proposed fix touches other helper functions too | The fix request wasn't scoped narrowly enough | Reject it and re-send Step 3's prompt, naming the exact function again |
| A different test fails than the one shown above | Your Lab 3 implementation may differ slightly from the reference shape | That's fine; use your own exact output in Step 2 rather than the example shown here |

## Looking Ahead

This lab's bug was directly visible once you looked in the right function. Lab 5 introduces a failure where the connection between the failing test and the actual cause isn't obvious at a glance, which is exactly when Debug mode earns its place over a direct Agent request.
