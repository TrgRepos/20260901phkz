# Exercise 1: Environment Setup and First Look

**Program:** Cursor AI-Powered Engineering Program, Session 2.2: Legacy System Modernization and AI-Driven TDD
**Duration:** ~20 minutes
**Format:** The instructor demonstrates this exact sequence first, you then repeat it on your own machine.

---

## Objective

Get `services/rate-engine` running locally, then take your first Ask-mode look at the legacy function this entire session is built around, without touching a single line of it.

## Before You Start

- [ ] You completed Level 2, Session 2.1, or have equivalent hands-on experience with Cursor's Ask, Agent, and Plan modes, plus `.cursor/rules/*.mdc` and `AGENTS.md`.
- [ ] You have `routewise-ops` open as a Cursor workspace, including `services/rate-engine/`.
- [ ] You have Python 3.10 or later installed. Confirm with `python3 --version` (macOS/Linux) or `python --version` (Windows).

## Repo Reference

| Path | Purpose |
|---|---|
| `services/rate-engine/rate_calculator.py` | The legacy function: `calculate_shipment_rate`. This session's entire target. |
| `services/rate-engine/db.py` | `get_customer_tier`, a small SQLite lookup the legacy function depends on. |
| `services/rate-engine/init_db.py` | One-time script that creates `rates.db` with synthetic sample customers. |
| `services/rate-engine/requirements.txt` | `pytest` and `pytest-mock`, nothing else. |

---

## Step 1: Create a Virtual Environment

Working inside `services/rate-engine/`:

**macOS/Linux:**

```bash
cd services/rate-engine
python3 -m venv venv
source venv/bin/activate
```

**Windows (Command Prompt):**

```cmd
cd services\rate-engine
python -m venv venv
venv\Scripts\activate.bat
```

**Windows (PowerShell):**

```powershell
cd services\rate-engine
python -m venv venv
venv\Scripts\Activate.ps1
```

Your terminal prompt should now show `(venv)` at the start of the line. Every command for the rest of this session assumes this virtual environment is active in that terminal.

## Step 2: Install Dependencies and Initialize the Database

Use `python -m pip` rather than a bare `pip` command for this step, and get in the habit of using `python -m pytest` rather than a bare `pytest` command for every test run in this session, starting in Lab 2. Once your virtual environment is active, `python` reliably points at the interpreter you just created, on every operating system; a bare `pip` or `pytest` command sometimes resolves to a different, unrelated installation that happens to be earlier on your system's PATH instead of the one in `venv`. That mismatch is exactly what produces confusing results like "it says it installed successfully but the import still fails," or a plain `pytest` command not being recognized at all, and it's a more common problem on Windows than on macOS or Linux, but it can happen on any of them. Every `pytest` command shown anywhere in this session's labs is written as `python -m pytest` for exactly this reason; use that form even if a bare `pytest` happens to work for you.

```bash
python -m pip install -r requirements.txt
python init_db.py
```

You should see `Created rates.db with 8 synthetic customers.` If `python -m pip install` fails on Linux with a message about an externally-managed environment, retry with `python -m pip install -r requirements.txt --break-system-packages`.

## Step 3: Confirm It Runs

```bash
python -c "from rate_calculator import calculate_shipment_rate; print(calculate_shipment_rate('RT-1', 'North', 8, 3, False, False, '2026-03-10', False, 'CUST-1001'))"
```

You should see `15.0` printed (the $15 minimum charge floor, since this particular shipment is small and short).

## Step 4: First Ask-Mode Look

Switch to **Ask mode** and send:

```
@services/rate-engine/rate_calculator.py
In one paragraph, what does this function do? Don't explain every branch
yet, just the overall shape: what goes in, what comes out, and roughly
how many distinct concerns it seems to be handling. Do not modify any files.
```

Read the answer. Notice whether it names the actual parameters and mentions the header comment, or whether it feels generic. A grounded answer should reference specifics like the region names, the tier discount, or the holiday list, not just "it calculates a shipping rate."

## Guardrails

- **Ask mode only** for Step 4, zero file edits during this exercise.
- Do not open `rate_calculator.py` in an editor and start reading top to bottom on your own yet. Lab 1 has a structured way to do this that's worth following even if you're tempted to just dive in.

## Definition of Done

- [ ] `(venv)` is active in your terminal.
- [ ] `rates.db` exists and Step 3's sanity check printed `15.0`.
- [ ] You have a grounded, specific answer from Ask mode about what the function does at a high level.

## If Something Goes Wrong

| Symptom | Likely Cause | Fix |
|---|---|---|
| `python3: command not found` (macOS/Linux) | Python isn't installed, or only available as `python` | Try `python --version`; if that works, use `python` in place of `python3` throughout this session |
| `pip install` reports success, but `ModuleNotFoundError: No module named 'pytest'` still happens | A bare `pip` command resolved to a different Python installation than the one in your active virtual environment, so the package installed somewhere your venv can't see | Re-run using `python -m pip install -r requirements.txt` instead of a bare `pip install`; this always targets the active interpreter |
| `'pytest' is not recognized as an internal or external command` (Windows), or `pytest: command not found` (macOS/Linux) | The same PATH issue as the `pip` row above: a bare `pytest` command isn't resolving to your active virtual environment at all | Use `python -m pytest -v` instead of a bare `pytest -v`, exactly as every command in this session's labs is written |
| `ModuleNotFoundError: No module named 'pytest'`, and `python -m pip install` wasn't used yet | The virtual environment isn't active, or dependencies were never installed | Confirm `(venv)` is showing in your prompt, then run `python -m pip install -r requirements.txt` |
| `sqlite3.OperationalError: no such table: customers` | `init_db.py` wasn't run, or was run from the wrong directory | Confirm you're inside `services/rate-engine/` and re-run `python init_db.py` |

## If You Don't Have Python Installed

If `python3 --version` (macOS/Linux) or `python --version` (Windows) fails, or reports a version older than 3.10, install Python before continuing with Step 1.

**Windows:**

The most reliable option is the official installer from [python.org/downloads](https://www.python.org/downloads/). On the first screen of the installer, **check the box labeled "Add python.exe to PATH"** before clicking Install; this single checkbox is the difference between everything in this exercise working and a string of "not recognized as an internal or external command" errors later.

If you have `winget` available (Windows 10 and 11 usually do), this works from PowerShell too:

```powershell
winget install Python.Python.3.12
```

Close and reopen your terminal after either installation method, then confirm with `python --version`.

**macOS:**

The official installer from [python.org/downloads](https://www.python.org/downloads/) works directly. If you use Homebrew:

```bash
brew install python@3.12
```

Confirm afterward with `python3 --version`.

**Linux (Debian/Ubuntu and similar):**

```bash
sudo apt update
sudo apt install python3 python3-venv python3-pip
```

Confirm afterward with `python3 --version`. If your distribution uses a different package manager (Fedora's `dnf`, Arch's `pacman`, etc.), install the equivalent `python3`, `python3-venv` (or equivalent), and `python3-pip` packages the same way you'd install any other package on your system.

**After installing, for any operating system:** close your current terminal window and open a new one before returning to Step 1, so your terminal picks up the newly installed `python` command.
