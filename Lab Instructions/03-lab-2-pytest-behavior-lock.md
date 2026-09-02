# Lab 2: Generating a Pytest Suite (The Behavior Lock)

**Program:** Cursor AI-Powered Engineering Program, Session 2.2: Legacy System Modernization and AI-Driven TDD
**Duration:** 90 minutes
**Repo:** `routewise-ops`, `services/rate-engine`

---

## Objective

Use **Agent mode** to generate a Pytest suite that captures `calculate_shipment_rate`'s *current* behavior exactly as it is, including all four special-case rules from Lab 1, without changing a single line of production code. Once this suite is green, it becomes your behavior lock: the thing every refactoring step in Labs 3 through 5 must keep passing.

## Before You Start

- [ ] You completed Lab 1 and have a written structural summary of the function, including all four special-case rules from Step 4: oversized-discount, fragile-insurance, fragile-over-30kg fee, and West-holiday-expedited fee.
- [ ] Your virtual environment is active and `rates.db` exists.
- [ ] You watched the instructor's demo of this exact sequence (Demo D2).

---

## Background: Two Ways to Keep Tests Independent of the Real Database

`calculate_shipment_rate` calls `get_customer_tier`, which opens a real SQLite file. A test suite that depends on that file existing, in that exact state, forever, is fragile. This lab uses two different techniques, deliberately, so you have both available later:

| Technique | What it does | When to reach for it |
|---|---|---|
| **Mocking** (`pytest-mock`'s `mocker.patch`) | Replaces `get_customer_tier` with a fake that returns whatever you tell it to, no real database involved | Fast, isolated unit tests of the pricing logic itself |
| **Fixture** (a temporary SQLite database) | Creates a real, throwaway database with known rows, points the code at it, tears it down after | Confirms the real database integration still works end to end |

## Step 1: Draft the Test Plan With Ask

Before generating any test code, confirm scope with Ask mode:

```
@services/rate-engine/rate_calculator.py
Based on this function's branches, list the distinct test cases a
thorough Pytest suite should cover: one line per case, no code yet.
Include all four special-case rules: oversized shipments never getting
a tier discount, fragile shipments skipping the insurance surcharge,
fragile shipments over 30kg getting an extra handling fee, and West-
region shipments on a holiday and expedited getting an extra fee.
Do not modify any files.
```

Compare this list against your own Lab 1 notes. Add anything missing (particularly boundary values: exactly 5kg, exactly 10km, exactly the insurance threshold, and the West-holiday-expedited combination specifically) before moving to Step 2.

## Step 2: Generate the Mock-Based Unit Tests

Switch to **Agent mode**:

```
Create services/rate-engine/tests/test_rate_calculator.py. Add unit
tests for calculate_shipment_rate using pytest-mock's mocker fixture to
mock rate_calculator.get_customer_tier, so these tests never touch the
real database. Cover every branch identified in Lab 1: each region's
base case, each weight band boundary, the weekend surcharge, the
holiday surcharge, the expedited surcharge, and these four specific
special-case rules, each with its own clearly named test:
1. Oversized shipments never receive a tier discount, regardless of tier.
2. Fragile shipments skip the insurance surcharge entirely, regardless
   of insurance_value.
3. Fragile shipments over 30kg get an extra flat handling fee.
4. A shipment that is all three of: West region, on a holiday date, and
   expedited, gets an extra flat fee that does not apply if any one of
   those three conditions is false.
Also include, for each of the four weight bands, at least one test with
is_fragile=True, not just the default non-fragile case; the fragile
surcharge percentage differs per band and each one needs its own check.
Don't modify rate_calculator.py.
```

This prompt spells out all four special-case rules by name and by the exact conditions that trigger them, on purpose. A shorter prompt like "cover the edge cases" is exactly what produces a suite that's missing the fourth rule; it only fires when three specific conditions are all true at once, which a general instruction is easy to satisfy without ever actually writing. The fragile-per-band instruction matters for the same reason: it's easy to test "weight bands" and "fragile shipments" as two separate, unrelated concerns and never actually combine them, leaving each band's fragile percentage completely unchecked.

Review the diff. Confirm:
- It only creates the new test file; `rate_calculator.py` is untouched.
- `mocker.patch("rate_calculator.get_customer_tier", ...)` (or equivalent) appears; no test opens `rates.db` directly.
- Each test asserts an exact expected value, not just "no exception raised."
- All four special-case rules above have their own test, and you can point to each one by name in the file.
- Each of the four weight bands has at least one test with `is_fragile=True`, not just the default light, non-fragile shipment.

## Step 3: Add a Fixture-Based Integration Test

```
In services/rate-engine/tests/test_rate_calculator.py, add a pytest
fixture that creates a temporary SQLite database with a small set of
known customers, patches db.DB_PATH to point at it for the duration of
the test, and tears it down afterward. Add one integration test that
calls calculate_shipment_rate without mocking get_customer_tier, to
confirm the real database path still works end to end. Don't modify
rate_calculator.py or db.py.
```

Review the diff against `frontend.mdc`-style expectations even though there's no such file here yet: is the fixture properly scoped (function-level, not accidentally shared across tests in a way that leaks state), does it clean up the temporary file afterward?

## Step 4: Run the Suite

```bash
cd services/rate-engine
python -m pytest -v
```

Every test should pass. If any fail, don't immediately ask Agent to "fix the tests." First determine whether the test's expected value is wrong (you mis-transcribed the logic) or whether it's revealing something you didn't understand about the real behavior. Re-read the relevant branch in `rate_calculator.py` before changing anything.

## Step 5: Add the Remaining Special-Case Tests Explicitly, If They're Not Already There

Go back through the test file and check off all four special-case rules from Lab 1 by name: oversized-discount, fragile-insurance, fragile-over-30kg fee, and West-holiday-expedited fee. If Step 2 didn't produce a clearly-named test for any of them, add the missing ones now as their own scoped request. The fourth rule is the one most likely to be missing, since it only fires under three conditions at once; check for it specifically, don't just assume it's there because the other three are.

```
Add tests to services/rate-engine/tests/test_rate_calculator.py for any
of these four special-case rules that don't already have a clearly
named test: an oversized platinum-tier shipment gets no discount; a
fragile shipment with a high insurance_value gets no insurance
surcharge; a fragile shipment over 30kg gets the extra handling fee; a
West-region, holiday, expedited shipment gets the extra $15 fee, and
confirm the fee does not apply if the region, the date, or the
expedited flag alone is changed. Name each test clearly. Don't modify
rate_calculator.py.
```

Run `python -m pytest -v` again and confirm the new tests pass, and that they actually exercise the condition they claim to: temporarily comment out the relevant line in `rate_calculator.py` for one of the four rules, confirm the matching test fails, then restore the line and confirm it passes again. This is the single best way to know a test is real protection and not just a check that happens to pass.

## Step 6: Save the Behavior Lock

Once every test passes and both edge cases have explicit, clearly-named tests, save this exact result as a permanent, timestamped record, before any refactoring begins:

```bash
python -m pytest -v > behavior_lock_baseline.txt
```

Open `behavior_lock_baseline.txt` and confirm it lists every test by name, all passing, with no failures. This file, together with the test file itself, is your behavior lock: written proof of exactly what this function did, and how thoroughly it was checked, at this specific point in time.

Every refactoring step from here forward should keep `python -m pytest -v` matching this exact result: the same tests, all still passing. If a future step ever requires changing an expected value in one of these tests, or a test from this baseline goes missing, that's a signal to stop and confirm the change was intentional, not a side effect. Keep `behavior_lock_baseline.txt` around for the rest of this session; you'll compare against it, not just against "tests are green" in the abstract.

## Guardrails

- **`rate_calculator.py` and `db.py` do not change in this lab**, except for the brief, deliberate, reverted edits in Step 5's verification check. Every lasting change should touch only files under `tests/`, plus the new baseline file at the end.
- **Tests assert exact expected values**, computed by understanding the code, not by running it once and copying whatever number came out.
- **Both techniques are represented**: at least one mock-based test and at least one fixture-based test.
- **All four special-case rules have their own named test, verified to actually fail when the rule is broken**, not just present in the file. A test that never fails under any circumstance isn't protecting anything.
- **No real customer data anywhere**, including in fixtures. Synthetic IDs only, matching the `CUST-XXXX` pattern already in `init_db.py`.

## Definition of Done

- [ ] `services/rate-engine/tests/test_rate_calculator.py` exists with tests covering every branch from Lab 1.
- [ ] At least one test uses `mocker.patch` to isolate from the real database.
- [ ] At least one test uses a fixture with a temporary database for integration coverage.
- [ ] All four special-case rules from Lab 1 have their own explicitly named, passing tests: oversized-discount, fragile-insurance, fragile-over-30kg fee, and West-holiday-expedited fee.
- [ ] You confirmed at least the West-holiday-expedited test actually fails when its rule is temporarily broken, then passes again once restored.
- [ ] `python -m pytest -v` shows every test passing.
- [ ] `behavior_lock_baseline.txt` exists and shows every test passing, saved as your behavior lock record.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| A mocked test still seems to hit the real database | The patch target is wrong; patching `db.get_customer_tier` instead of `rate_calculator.get_customer_tier` doesn't work because of how the import was written | Patch the name as it's used inside `rate_calculator.py` (`rate_calculator.get_customer_tier`), not where it's defined |
| The fixture-based test fails intermittently | The temporary database file isn't being cleaned up between test runs, or `db.DB_PATH` isn't actually being patched | Confirm the fixture patches `db.DB_PATH` (not a local copy of it) and removes the temp file in a `finally` block or fixture teardown |
| A test's expected value doesn't match what the function returns | Either the test was written from a misunderstanding of the logic, or Lab 1's structural notes missed something | Re-read the relevant branch directly; don't just adjust the test's expected number until it passes, confirm which side is actually correct |
| Later, in Lab 4 or Lab 5, a seeded bug doesn't make any test fail | This lab's suite is missing a test for the specific rule the bug affects, most often the West-holiday-expedited fee, since it only fires under three conditions at once | Come back to this lab and add the missing test now, using Step 5's verification technique to confirm it actually fails when that rule is broken, before continuing the later lab |

## Looking Ahead

Lab 3 starts refactoring `rate_calculator.py`, in small steps, with this exact suite as the safety net. If a refactor step ever makes a test in this file fail, that's the signal to stop and investigate, not to update the test.
