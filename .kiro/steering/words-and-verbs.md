---
inclusion: auto
name: adding new words or verbs
description: When adding a new word or verb use this steering
---

# Adding Words and Verbs to CONJI

## Data Files Overview

| File | Purpose |
|------|---------|
| `public/words.json` | Vocabulary: nouns, adjectives, adverbs, pronouns, connectors, conjunctions, verb conjugated forms used in context |
| `public/group-1.json` | Group I verbs — infinitives ending in **-a** (excl. -ea) |
| `public/group-2.json` | Group II verbs — infinitives ending in **-ea** |
| `public/group-3.json` | Group III verbs — infinitives ending in **-e** |
| `public/group-4.json` | Group IV verbs — infinitives ending in **-i / -î** |
| `public/group-information.json` | Metadata: group/subgroup codes and descriptions |

---

## words.json — Entry Format

All entries are objects in a flat JSON array. Every entry requires both fields:

```json
{ "value": "romanian word or phrase", "translations": ["english1", "english2"] }
```

**Rules:**
- `value` — the Romanian word/phrase exactly as it appears in learning material. Preserve diacritics (ă, â, î, ș, ț).
- `translations` — array of English equivalents, ordered from most common to least. Always at least one item.
- Multi-word phrases are allowed (e.g. `"pe de altă parte"`, `"de obicei"`).
- Definite article forms get their own entry when the article changes the learning value (e.g. `"carte"` + `"cartea"`).
- Conjugated verb forms (e.g. `"merg"`, `"mergi"`) belong here when they appear in reading texts and need lookup. The full verb's conjugation table lives in the group files.
- Do NOT add the bare infinitive (e.g. `"a merge"`) to words.json — that belongs only in the verb group files.

**Examples:**

```json
{ "value": "totuși", "translations": ["however", "yet", "still", "nevertheless"] },
{ "value": "în primul rând", "translations": ["first of all", "in the first place", "firstly"] },
{ "value": "merg", "translations": ["I go", "I walk"] },
{ "value": "preferam", "translations": ["I preferred", "I used to prefer"] }
```

---

## group-N.json — Verb Entry Format

Each group file has this shape:

```json
{
  "group": "Grupa N - description",
  "verbs": [ ...verb objects... ]
}
```

Each verb object:

```json
{
  "infinitive": "a [verb]",
  "type": "regular",
  "group": 1,
  "subgroup": 1,
  "infinitive_translated": ["to do something"],
  "conjugations": {
    "prezent":          { "eu": "", "tu": "", "el/ea": "", "noi": "", "voi": "", "ei/ele": "" },
    "perfect_compus":   { "eu": "", "tu": "", "el/ea": "", "noi": "", "voi": "", "ei/ele": "" },
    "viitor_literar":   { "eu": "", "tu": "", "el/ea": "", "noi": "", "voi": "", "ei/ele": "" },
    "viitor_familiar":  { "eu": "", "tu": "", "el/ea": "", "noi": "", "voi": "", "ei/ele": "" },
    "conjunctiv":       { "eu": "", "tu": "", "el/ea": "", "noi": "", "voi": "", "ei/ele": "" },
    "conditional":      { "eu": "", "tu": "", "el/ea": "", "noi": "", "voi": "", "ei/ele": "" },
    "imperativ":        { "tu": "", "voi": "" }
  }
}
```

**Group assignment:**

| Infinitive ending | File |
|-------------------|------|
| `-a` (not `-ea`) | `group-1.json` |
| `-ea` | `group-2.json` |
| `-e` | `group-3.json` |
| `-i` or `-î` | `group-4.json` |

**Subgroup assignment (from group-information.json):**

- Group 1: `1` = -ez pattern · `2` = no -ez · `3` = stem vowel change · `99` = irregular
- Group 2: `1` = -ez/-ează · `2` = stem vowel change · `99` = irregular
- Group 3: `1` = regular · `2` = stem consonant change · `99` = irregular
- Group 4: `1` = -esc pattern · `2` = stem change · `3` = -ăsc pattern · `99` = irregular

**type** field: `"regular"` or `"irregular"`

---

## Decision: words.json vs group file

```
Is it a bare infinitive (a face, a merge)?
  YES → group-N.json only
  NO  → Is it a conjugated form, connector, noun, adjective, adverb?
          YES → words.json
```

Conjugated forms like `"merg"`, `"gândesc"`, `"prefer"` go in **words.json** because they appear as vocabulary in reading texts. Their full conjugation table lives in the group file under the parent infinitive.

---

## Avoiding Duplicates

Before adding any entry, run the duplicate-check skill:

```
#duplicate-check
```

This runs `node .kiro/skills/scripts/find-duplicates.js` and prints any existing `value` collisions in `words.json` and any `infinitive` collisions across all group files.

See `.kiro/skills/find-duplicates.md` for full usage.

---

## Quick Reference — Common Connectors & Discourse Markers

These go in `words.json` (not verb groups):

```json
{ "value": "în primul rând", "translations": ["first of all", "firstly"] },
{ "value": "în plus", "translations": ["moreover", "in addition", "furthermore", "besides"] },
{ "value": "pe de altă parte", "translations": ["on the other hand"] },
{ "value": "totuși", "translations": ["however", "yet", "still", "nevertheless"] },
{ "value": "de aceea", "translations": ["therefore", "that's why", "for that reason"] },
{ "value": "probabil", "translations": ["probably", "likely"] },
{ "value": "în cazul acesta", "translations": ["in that case", "in this case"] },
{ "value": "dacă mă gândesc bine", "translations": ["come to think of it", "on second thought"] },
{ "value": "de obicei", "translations": ["usually", "normally"] },
{ "value": "apoi", "translations": ["then", "later"] }
```
