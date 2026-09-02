# Lab 6: Finding Performance Bottlenecks With Evidence

**Program:** Cursor AI-Powered Engineering Program, Session 2.2: Legacy System Modernization and AI-Driven TDD
**Duration:** 75 minutes
**Repo:** `routewise-ops`, `services/rate-engine`

---

## Objective

Find out whether `calculate_shipment_rate` has a real performance problem, using an actual benchmark and a profiler, not a guess about which part of the code "seems slow." Then, if the evidence supports it, fix the specific bottleneck in a small scoped change and confirm both that it's faster and that the Lab 2 behavior lock is still green.

## Before You Start

- [ ] You completed Lab 5. `python -m pytest -v` is green.
- [ ] You watched the instructor's demo of this exact sequence (Demo D6).

---

## Background: A Hypothesis Is Not Evidence

It's tempting to look at a long function and guess where the slow part is. This lab deliberately separates "what looks slow" from "what's actually slow," using a real timing benchmark first, then a profiler to confirm exactly which call is responsible, before proposing any change.

## Step 1: Write a Baseline Benchmark

Switch to **Agent mode**:

```
Create services/rate-engine/benchmark.py. It should call
calculate_shipment_rate 1000 times with a mix of valid, varied
arguments (different regions, weights, dates, customer ids), using
Python's timeit module, and print the total time and the average time
per call in milliseconds. Don't modify rate_calculator.py or db.py.
```

Run it:

```bash
python benchmark.py
```

Write down the average time per call. This is your baseline.

## Step 2: Ask for a Hypothesis, Labeled as a Hypothesis

```
@services/rate-engine/rate_calculator.py
@services/rate-engine/db.py
Based on reading this code, what's your best guess for the most likely
performance bottleneck if this function is called many times in a row?
Explicitly label this as a hypothesis to be confirmed, not a conclusion.
Do not modify any files.
```

Read the answer, but don't act on it yet. A guess, even an informed one, isn't the same as evidence.

## Step 3: Confirm With a Profiler

```bash
python -m cProfile -s cumulative benchmark.py
```

Look at the top few entries sorted by cumulative time. You should see `sqlite3.connect` (or similar SQLite connection overhead) taking up a disproportionate share of total time relative to how simple the actual query is.

## Step 4: Compare the Hypothesis to the Evidence

In your own notes, write one or two lines: did Step 2's hypothesis match Step 3's profiler output? This step matters even when the answer is yes; the discipline is confirming, not assuming.

## Step 5: Propose a Scoped Fix

```
In services/rate-engine/db.py only, cache the result of get_customer_tier
per customer_id using functools.lru_cache, so repeated lookups for the
same customer don't open a new SQLite connection every time. Don't
modify rate_calculator.py.
```

Review the diff. Confirm it only touches `db.py`, and that the caching doesn't change what the function returns for any given `customer_id`, only how often it hits the database to get that answer.

## Step 6: Re-Run Everything

```bash
python -m pytest -v
python benchmark.py
```

Confirm the behavior lock is still fully green, then compare the new average time per call against Step 1's baseline. Write down the improvement, as a percentage or a straight time difference.

## Step 7: Note the Trade-Off Out Loud

`functools.lru_cache` on `get_customer_tier` means a customer's tier, once looked up, stays cached for the lifetime of the process, even if the underlying database row changes later. For this workshop's synthetic data, that's a fine trade to make. In a real system, you'd want to discuss cache invalidation with whoever owns the customers table before shipping this. Write one line about this trade-off in your own notes; noticing it is the point of this step, not necessarily solving it here.

## Guardrails

- **Benchmark before profiling, profile before fixing.** Don't skip straight to a fix based on a guess, even a well-reasoned one.
- **The fix is scoped to `db.py` only.** `rate_calculator.py`'s logic doesn't change.
- **Re-run the full behavior-lock suite after the fix**, not just the benchmark. A faster function that changed behavior is not a successful outcome.

## Definition of Done

- [ ] You have a written baseline average time per call from Step 1.
- [ ] You have a labeled hypothesis from Step 2, checked against real profiler output in Step 3.
- [ ] `db.py` was changed to cache `get_customer_tier`, and `rate_calculator.py` was not touched.
- [ ] `python -m pytest -v` is still fully green after the fix.
- [ ] You have a written before-and-after comparison of the benchmark numbers.
- [ ] You noted the cache-invalidation trade-off in your own words.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| The profiler doesn't show SQLite connection overhead as significant | Your benchmark's mix of customer IDs may be too small a sample, or the machine's filesystem cache is masking the cost | Increase the call count in `benchmark.py` to 5000 or more and re-run |
| The benchmark shows little to no improvement after caching | `functools.lru_cache` may have been applied to the wrong function, or a new connection is still being opened somewhere per call | Confirm the decorator is directly on `get_customer_tier`, and that no other code path bypasses it |
| A test fails after the caching change | A test may depend on `get_customer_tier` being called fresh every time, which is no longer true with caching in place | Check whether that specific test needs to clear the cache between calls (`get_customer_tier.cache_clear()`) as part of its setup |

## Looking Ahead

This is the last lab of Session 2.2. `rate_calculator.py` is now covered by a real test suite, its logic is organized into named, typed helper functions, and its one confirmed performance bottleneck is fixed and measured, not guessed at. The habits from this session (read before touching, lock behavior before refactoring, small scoped steps, evidence before fixes) apply to every legacy system you'll work in after this workshop, not just this one.
