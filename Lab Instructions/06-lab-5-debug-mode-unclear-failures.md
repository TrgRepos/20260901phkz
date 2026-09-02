# Lab 5: Debug Mode for Unclear Failures

**Program:** Cursor AI-Powered Engineering Program, Session 2.2: Legacy System Modernization and AI-Driven TDD
**Duration:** 60 minutes
**Repo:** `routewise-ops`, `services/rate-engine`

---

## Objective

Practice reaching for **Debug Mode** instead of a direct Agent fix when a failing test's cause isn't obvious from reading the function it points at. Debug Mode is Cursor's dedicated loop for exactly this situation: instead of guessing from a static read of the code, it generates hypotheses, adds temporary runtime logging to test them, has you reproduce the failure so it can capture real execution data, and only proposes a fix once that evidence confirms a root cause, cleaning up its own instrumentation afterward.

## Before You Start

- [ ] You completed Lab 4. `python -m pytest -v` is green.
- [ ] You watched the instructor's live debugging demo immediately before this lab (Demo D5).

---

## Background: What Debug Mode Actually Does

Debug Mode is not "Ask mode with extra reasoning." It's a distinct loop, built around runtime evidence instead of a static read of the source:

1. You describe the bug and how to reproduce it.
2. Cursor reads the codebase and proposes several hypotheses for what might be wrong.
3. Cursor adds temporary logging or print statements aimed at testing those hypotheses, directly in the code.
4. You reproduce the failure, so that instrumentation actually runs and captures real data.
5. Cursor reads the resulting output, confirms (or rules out) each hypothesis using that evidence, and states a root cause.
6. Cursor proposes a targeted fix.
7. You reproduce once more to confirm the fix actually resolves it.
8. Cursor removes all the temporary instrumentation it added, leaving a clean, minimal diff.

For a failing Pytest test, "reproducing the failure" is simple: it's re-running that one test. That's what makes this lab a good fit for Debug Mode even though nothing is a long-running server: the test itself is the reproduction step, every time, on demand.

---

## Seed This Bug

In `services/rate-engine/rate_calculator.py`, find where `calculate_shipment_rate` calls `_apply_date_surcharges` and unpacks its result. Depending on how your Lab 3 extraction wrapped the line, it should look something like this:

```python
    total, is_holiday = _apply_date_surcharges(
        total, requested_date, is_expedited, is_oversized
    )
```

Add a stray line immediately after it:

```python
    total, is_holiday = _apply_date_surcharges(
        total, requested_date, is_expedited, is_oversized
    )
    is_holiday = False
```

Run the suite once to confirm it now fails:

```bash
python -m pytest -v
```

If every test still passes after adding this line, stop here and go back to Lab 2 before continuing. It means your test suite doesn't yet have a test for the West-holiday-expedited fee specifically, the one rule this exact bug is designed to break. Add that test now, following Lab 2 Step 5's pattern, confirm it fails with the bug in place, then come back to this step.

## Why This One Is Different From Lab 4

Notice that `_apply_date_surcharges` itself is completely correct. If you only read that one function, as you might if you jumped straight to a fix, you'd find nothing wrong. The actual bug is a single stray line at the *call site*, easy to miss on a quick read, and it silently disables the West-region holiday special case further down in the function. This is exactly the situation Debug Mode is for: the failing test's symptom and its cause aren't in the same place, and a targeted guess is more likely to waste time than find it. Debug Mode's answer to that problem isn't to think harder about the existing code; it's to add temporary instrumentation and watch the actual execution path, the same way you'd add a `print()` statement by hand to narrow down a confusing bug, except Cursor writes, runs, reads, and removes that instrumentation for you.

## Step 1: Identify the Exact Reproduction Command

```bash
python -m pytest -v tests/test_rate_calculator.py -k west
```

(Adjust the `-k` filter to match whatever you named your West-region holiday test in Lab 2.) Confirm this single command reliably reproduces the failure, every time you run it. Copy the full failure output, including the assertion and the expected versus actual values; you'll hand both the command and this output to Debug Mode in Step 2.

## Step 2: Switch to Debug Mode and Describe the Bug

Switch to **Debug Mode**. Describe the failure and give Cursor the exact way to reproduce it, rather than only pasting the error and asking it to guess:

```
The test below is failing. I don't know where the problem is yet.

Reproduce it with: python -m pytest -v tests/test_rate_calculator.py -k west

Exact failure output:
<paste the exact pytest output from Step 1 here>

Investigate the root cause before proposing any fix.
```

Cursor should respond with a few hypotheses for what might be wrong, and propose adding temporary logging or print statements to test them, most likely tracing the value of `is_holiday` at various points between `_apply_date_surcharges` and the West-region check.

## Step 3: Let Cursor Instrument, Then Reproduce

Accept the instrumentation Cursor proposes. Then, exactly as it asks, run the reproduction command again so the new logging actually executes:

```bash
python -m pytest -v -s tests/test_rate_calculator.py -k west
```

The `-s` flag matters here: Pytest normally captures printed output, and `-s` lets it reach your terminal so both you and Cursor can see what the instrumentation captured. Paste this new, instrumented output back to Cursor.

## Step 4: Let Cursor Read the Evidence and Confirm Root Cause

Cursor should now correlate the logged values against the code path and state a specific root cause, grounded in what the instrumentation actually showed, not a guess about what "usually" causes this kind of bug. A good answer traces `is_holiday` from a correct value immediately after `_apply_date_surcharges` returns, to an incorrect one by the time the West-region check runs.

Before moving on, confirm out loud (to yourself) that you understand *why* the bug happens: `is_holiday` is correctly computed and returned, then immediately and silently overwritten with `False` on the very next line, so every downstream check that depends on it (including the West-region special case) behaves as if no shipment is ever on a holiday.

## Step 5: Request the Fix and Clean Up Instrumentation

Once the root cause is confirmed, the fix is already unambiguous: remove the one stray line. Say so directly:

```
The root cause is confirmed: is_holiday is correctly computed by
_apply_date_surcharges, then immediately overwritten by a stray
"is_holiday = False" line right after the call, inside
calculate_shipment_rate. Remove only that stray line, and remove all
of the temporary logging or print statements added during this
investigation. Don't restructure how the value is returned, stored, or
passed anywhere, and don't touch _apply_date_surcharges itself.
```

The correct fix removes the stray `is_holiday = False` line, and the diff should also remove every line of instrumentation Cursor added in Step 2, leaving nothing behind. If Agent proposes anything more elaborate than that, or leaves debug print statements in place, that's a sign the request was still too open-ended, not a sign the bug is more complicated than it looks.

## Step 6: Reproduce Once More to Verify

```bash
python -m pytest -v
```

Confirm every test passes again, and open `rate_calculator.py` yourself to confirm no stray `print`, logging, or debug statements were left behind from Step 3's instrumentation.

## Guardrails

- **Don't jump straight to `_apply_date_surcharges` and start editing it.** That function is correct; editing it would be a wasted, and potentially harmful, change.
- **Use Debug Mode's full loop, not a shortcut.** Let it add instrumentation and actually reproduce the failure with it in place before accepting a root cause; don't skip straight from the original error to a fix request.
- **State the root cause in your own words before requesting a fix**, even though Debug Mode will state it too; this is the habit worth building.
- **Once a root cause is fully confirmed and unambiguous, say what the fix is, not just where to look.** "Propose a fix limited to X" is still an open invitation to invent something; "the fix is to remove this one line, do that" closes off the invention.
- **Confirm all temporary instrumentation is removed** before considering the lab done. A "fixed" bug that leaves debug print statements scattered through production code isn't actually finished.

## Definition of Done

- [ ] You seeded the bug and confirmed the West-region holiday test fails.
- [ ] Debug Mode added temporary instrumentation and you reproduced the failure with it in place, rather than skipping straight to a fix.
- [ ] Debug Mode's root-cause explanation was grounded in the instrumented output, and correctly traced the problem to the stray line after the `_apply_date_surcharges` call, not into the helper function itself.
- [ ] The fix removed only the stray line, and all temporary instrumentation was removed with it.
- [ ] `python -m pytest -v` shows every test passing again.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| No test fails after seeding the bug | Your test suite doesn't have a case that actually exercises the West-region, holiday, expedited combination; this is common enough that the Seed step above already tells you to check for it | Go back to Lab 2 Step 5 and add the missing West-holiday-expedited test, using its verification technique to confirm the new test actually fails with this bug in place, before returning here |
| Debug Mode's first hypothesis targets `_apply_date_surcharges` | The investigation stopped too early, at the first plausible-looking location instead of instrumenting and checking the actual data flow | Ask a follow-up: "Add logging that also captures is_holiday's value immediately after the function call returns, before any other line runs, then let me reproduce again" |
| Pytest's printed instrumentation output doesn't show up in your terminal | The `-s` flag was left off, so Pytest captured and hid the printed output | Re-run with `-s`: `python -m pytest -v -s tests/test_rate_calculator.py -k west` |
| The fix also changes something inside `_apply_date_surcharges` | The fix request wasn't scoped narrowly enough to the call site | Reject it; re-send Step 5's prompt, naming the call site specifically |
| Agent proposes something elaborate, like adding a config file, a JSON structure, restructuring how values are passed, or rewriting the function's signature, instead of just deleting the stray line | The fix request was too open-ended; once a root cause is confirmed, asking Agent to "propose a fix" without saying what that fix is leaves room for it to invent a bigger solution than the bug needs | Reject the diff entirely; re-send Step 5's prompt using the exact wording above, which states the fix (remove the one line) directly instead of asking Agent to figure it out |
| Debug print statements are still in the file after the fix is applied | The fix request didn't explicitly ask for the instrumentation to be removed, or Cursor's cleanup step was skipped | Ask directly: "Remove every temporary logging or print statement added during this debugging session" and confirm the resulting diff against the file from before Step 2 |

## Looking Ahead

Lab 6 shifts from correctness to performance: using targeted prompts and real benchmark evidence, not guesses, to find out whether any part of this function is actually slow enough to matter.
