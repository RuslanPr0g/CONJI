---
name: book-plot
description: Use when creating a plot outline for a new CONJI book, or reviewing/updating the plot of an existing one. Plots live in plots/*.md and describe a book's arc, twists, ending, and chapter structure without writing the actual book prose. Use before writing any book content — see the write-book skill for that.
---

# Book Plot — Create or Review

This skill covers **planning** a book's story. It never writes actual book
prose (the Romanian chapter text in `public/book-contents/`) — that's the
`write-book` skill's job, and it always works from the plot doc this skill
produces.

## Where Plots Live

One Markdown file per book in `plots/`, named as a kebab-case slug of the
title:

```
plots/<slug-of-title>.md
```

Existing examples: `plots/povestea-naturii-drumul-lui-andrei.md`,
`plots/trenul-care-nu-opreste.md`. Read one of these before writing a new
plot — they show the expected level of detail (chapter *beats*, not chapter
*prose*).

## Plot Document Template

```markdown
---
book_id: <uuid, or "TBD" for a not-yet-created book>
title: "<Book Title>"
language: ro
level: <beginner (A1-A2) | intermediate (A2-B1) | advanced (B1+)>
status: <planned | ongoing | complete>
chapters_written: <N — must match files in public/book-contents/<id>/>
content_path: public/book-contents/<book_id>/
---

# <Title> — Plot

## Logline
One or two sentences.

## High-Level Arc
Beginning → middle → end in a short paragraph. Spoilers expected — this is
a planning document, not back-cover copy.

## Key Twists / Turning Points
Bulleted list, in order. If the book is intentionally twist-free (e.g. a
slice-of-life beginner reader), say so explicitly rather than omitting the
section.

## Ending
What actually happens at the close of the book **as currently planned or
written**. If the book is `ongoing` and unfinished, describe the current
cliffhanger/stopping point honestly instead of inventing a resolution.

## Detailed Chapter Breakdown
### Chapter N — <title>
- Setting:
- Beats: (bullet list of what happens — a compressed summary, never full
  prose or dialogue lifted from the book)
- Characters:
- Ends on:

(repeat per chapter)

## Characters
Name — role/description, one line each.

## Setting & Tone
Where/when the story takes place, and the tone/register to keep consistent.

## Themes
One short paragraph or list.

## Continuity Notes (for future chapters)
Open threads, unresolved questions, and constraints future chapters must
respect (tone, level, things not to contradict).
```

**Level of detail rule:** describe *what happens*, not *how it's narrated*.
No paragraphs of prose, no verbatim dialogue — that belongs only in the
actual book files.

## Workflow: New Book Plot

1. Get the essentials from the user (or infer/ask if missing): title,
   target Romanian level (A1/A2/B1+ — check `public/group-information.json`
   and `words.json` vocabulary complexity for calibration), rough length
   (how many chapters), genre/tone, and the core premise.
2. Draft the full template above: logline, arc, twists, ending, a chapter
   breakdown covering every planned chapter (even ones not yet written),
   characters, setting/tone, themes, continuity notes.
3. Set `status: planned` and `chapters_written: 0` if no prose exists yet.
4. Save to `plots/<slug>.md`.
5. Do **not** create `public/book-contents/<id>/` files, and do not add an
   entry to `public/books.json` — that happens when `write-book` produces
   the first chapter. If `book_id` isn't known yet, leave it as `TBD` and
   let `write-book` fill it in when the book is actually created.

## Workflow: Review / Update an Existing Plot

1. Read the existing `plots/<slug>.md`.
2. Cross-check it against reality:
   - Does `book_id` match an entry in `public/books.json`?
   - Does `chapters_written` match the number of `N.html` files in
     `public/book-contents/<book_id>/`, and match `content_length` in
     `books.json`?
   - Does the "Detailed Chapter Breakdown" have an entry for every chapter
     file that actually exists? Skim the real HTML files for any chapter
     whose plot summary doesn't match what was actually written (plots can
     drift as chapters get written or edited).
3. Report any mismatches or inconsistencies found (missing/extra chapters,
   contradicted continuity notes, twists that never materialized, etc.).
4. Apply fixes to the plot doc as agreed with the user — e.g. update
   `status`/`chapters_written`, correct a chapter summary, add newly
   planned chapters to the breakdown, or extend the arc/twists/ending
   sections if the user wants to plan further chapters.
5. Never edit the actual book HTML files from this skill — only the plot
   Markdown. Content changes belong to `write-book`.
