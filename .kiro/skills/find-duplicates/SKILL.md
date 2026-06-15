---
inclusion: manual
---

# Skill: find-duplicates

Checks `words.json` and all verb group files for duplicate entries before you add new vocabulary or verbs.

## How to Run

Run from the project root:

```bash
# Full check — words.json + all group files
node .kiro/skills/scripts/find-duplicates.js

# words.json only
node .kiro/skills/scripts/find-duplicates.js --words-only

# Verb groups only
node .kiro/skills/scripts/find-duplicates.js --verbs-only

# Check one specific value before adding it
node .kiro/skills/scripts/find-duplicates.js --check "merg"
node .kiro/skills/scripts/find-duplicates.js --check "a merge"
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No duplicates — safe to add |
| `1` | Duplicates found — review before proceeding |

## When to Use

Run this **before** adding any new entry to `words.json` or any `group-N.json`. The steering file (`words-and-verbs.md`) references this skill as the required pre-check step.

## What It Checks

**words.json** — scans all `"value"` fields, case-insensitive. Reports any value that appears more than once.

**group-1..4.json** — scans all `"infinitive"` fields across all four files. Catches the same verb added to two groups by mistake.

## Example Output

```
🔍 CONJI Duplicate Checker

────────────────────────────────────────────────────────────
 words.json  (1148 entries)
────────────────────────────────────────────────────────────
  ⚠️  "merg"  ×2  (entries: 45, 1143)

────────────────────────────────────────────────────────────
 Verb groups (group-1..4.json)
────────────────────────────────────────────────────────────
  ✅ No duplicate infinitives found.

────────────────────────────────────────────────────────────
 ❌ Duplicates found. Review before adding new entries.
```

```
🔍 CONJI Duplicate Checker

────────────────────────────────────────────────────────────
 words.json  (1148 entries)
────────────────────────────────────────────────────────────
  ✅ No duplicates found.

────────────────────────────────────────────────────────────
 Verb groups (group-1..4.json)
────────────────────────────────────────────────────────────
  ✅ No duplicate infinitives found.

────────────────────────────────────────────────────────────
 ✅ All clear.
```

## Single-Value Check Example

```
node .kiro/skills/scripts/find-duplicates.js --check "totuși"

⚠️  "totuși" already exists:

  In words.json:
    [entry 1129] { "value": "totuși", "translations": ["however", "yet", "still", "nevertheless"] }
```
