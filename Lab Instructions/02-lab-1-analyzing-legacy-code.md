# Lab 1: Analyzing the Legacy Rate Calculator

**Program:** Cursor AI-Powered Engineering Program, Session 2.2: Legacy System Modernization and AI-Driven TDD
**Duration:** 60 minutes
**Repo:** `routewise-ops`, `services/rate-engine`

---

## Objective

Build a complete, written, structural understanding of `calculate_shipment_rate` using **Ask mode only**, before anyone touches a single line of it. By the end of this lab you will have documented: every input and what it controls, every output path, every side effect, every branch, and the edge cases that aren't obvious from a first read.

## Before You Start

- [ ] You completed Exercise 1: your virtual environment is active and `rates.db` exists.
- [ ] You watched the instructor's demo of this exact sequence (Demo D1).
- [ ] You are in **Ask mode** for this entire lab. No file edits.

---

## Background: Why Ask Before Anything Else

`calculate_shipment_rate` has no tests, no type hints, and one header comment written by someone reconstructing history from commit messages, not from direct knowledge. Every branch in it currently produces real invoice amounts. Reading it carefully, in a structured way, before generating a single test or touching a single line, is what separates a safe modernization from an expensive guess.

---

## Step 1: Inputs and What Each One Controls

```
@services/rate-engine/rate_calculator.py
List every parameter calculate_shipment_rate accepts. For each one, say
in one line what it controls in the final price, and whether it has a
default value. Do not modify any files.
```

Write the answer down (your own notes, not just what Cursor said) as a table: parameter, type you'd expect it to be, what it affects.

## Step 2: Outputs and Side Effects

```
@services/rate-engine/rate_calculator.py
What does this function return, and under what conditions does it raise
an exception instead? Does it have any side effects, like writing to a
file, printing, or modifying anything outside its own local variables?
Do not modify any files.
```

Confirm the answer correctly identifies the `ValueError` cases and the fact that `get_customer_tier` performs a database read (a side effect, even though it's read-only).

## Step 3: Map Every Branch

```
@services/rate-engine/rate_calculator.py
Walk through every top-level branch in this function in the order they
execute: region selection, weight surcharge, weekend/holiday surcharge,
expedited surcharge, tier discount, the fragile-over-30kg handling fee,
the West-region holiday-and-expedited special case, and the insurance
surcharge. For each one, state the exact condition that triggers it and
what it does to the running total. Do not modify any files.
```

This is the longest response in this lab. Read it slowly, and open the real file side by side to confirm each claim. Pay particular attention to the last two items in the list; they're easy to skim past because each one only fires under a narrow, specific combination of inputs, not from a single flag alone.

## Step 4: Find the Edge Cases Cursor's First Pass Might Miss

```
@services/rate-engine/rate_calculator.py
Now specifically look for edge cases and interactions between branches
that wouldn't be obvious from reading each branch in isolation. For
example: what happens to a fragile, oversized shipment on a holiday, for
a platinum customer? What happens if insurance_value is provided but the
shipment is also fragile? Are there any surcharges that only apply for
one specific region, or only when several flags are true at once?
Do not modify any files.
```

A strong answer should surface at least these four real quirks in the code, and you should end this step with all four written down by name, not just recognized in passing:

- **Oversized shipments never get a tier discount**, regardless of customer tier, and this rule exists only as a comment, not documented anywhere else.
- **The insurance surcharge is skipped entirely if the shipment is marked fragile**, regardless of insurance value.
- **Fragile shipments over 30kg get an extra flat handling fee**, applied after the tier discount, on top of everything else.
- **West-region shipments that are both on a holiday and expedited get an extra flat fee**, a combination of three specific conditions (region, date, and a flag) that no single test of region, or of holiday, or of expedited alone will ever exercise.

The fourth one is the easiest to miss, because it only exists at the intersection of three things being true simultaneously, and nothing about reading the weekend/holiday branch or the region branch in isolation will surface it. If Cursor's answer misses any of these four, ask a more targeted follow-up naming the specific interaction, and note that this is exactly the kind of thing a first-pass summary can miss; the fourth pass exists because the first three don't catch everything.

## Step 5: Cross-Check Against the Real File

Open `rate_calculator.py` yourself and confirm, line by line, that Steps 1 through 4's claims are accurate. Specifically verify:

- The five region names and their per-km base rates
- The four weight bands and their thresholds
- The exact holiday dates in the `HOLIDAYS` set
- The order of operations: is the fragile-over-30kg fee applied before or after the tier discount? Is the West-holiday-expedited fee applied before or after the insurance surcharge?

If anything Cursor said doesn't match the real file, note the discrepancy. Ask mode's output is a draft to verify, not ground truth, exactly as it was in Level 1.

## Step 6: Write a Structural Summary

In your own words (5 to 10 lines, in your own notes, not sent to Cursor), summarize: what this function does, its main sources of complexity, and all four special-case rules from Step 4, by name. This is what Lab 2's test suite will be built to protect, and Lab 2 will ask you to confirm all four have their own explicitly named test, not just the first two.

## Guardrails

- **Ask mode only for the entire lab.** Zero file edits.
- **Every prompt should reference the real file explicitly** (`@services/rate-engine/rate_calculator.py`), not a vague "explain the rate calculator."
- **Cross-check at least the items in Step 5** against the actual source, don't take Ask mode's word for it uncritically.
- **Write down all four special-case rules from Step 4 by name**, not just the two that feel most obviously like "business logic." A rule that only fires for one region on one kind of day is just as real as one that fires for any oversized shipment.

## Definition of Done

- [ ] You have a written table of every parameter and what it controls.
- [ ] You have a written list of every branch and its trigger condition.
- [ ] You identified all four special-case rules by name: oversized-discount, fragile-insurance, fragile-over-30kg fee, and West-holiday-expedited fee (or confirmed you already knew them from your own reading).
- [ ] You cross-checked at least four specific claims against the real file.
- [ ] You have a 5 to 10 line structural summary ready for Lab 2.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Ask mode's branch walkthrough skips the insurance surcharge | The function is long enough that a broad question can lose detail toward the end | Ask a narrower follow-up specifically about the insurance block near the bottom of the file |
| Ask mode invents a business reason for the oversized-discount rule | The model is filling a gap since the real reason isn't in the code | Don't accept invented justifications; the header comment says the real reason is in an old email thread, not recoverable from the code, and that's a fine thing to write down as unknown |
| Ask mode's edge-case pass only surfaces two or three of the four special-case rules | A prompt asking generally for "edge cases" can miss a rule that depends on three conditions at once, since it's rare and easy to skim past in a long file | Ask directly: "Is there any surcharge that only applies for one specific region, combined with a specific date condition and a specific flag?" and confirm the West-holiday-expedited fee comes back by name |

## Looking Ahead

Lab 2 turns this structural understanding into an executable safety net: a Pytest suite that locks in current behavior, including all four special-case rules from Step 4, before any refactoring begins.
