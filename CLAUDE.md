# Conji

Conji is an Angular app for practicing Romanian vocabulary and verb conjugation. Vocabulary and verb data live in `public/` as JSON (`words.json`, `group-1.json`..`group-4.json`, `group-information.json`). Conji also has an in-app reader with short Romanian books, stored as `public/books.json` (metadata) and `public/book-contents/<book-id>/<chapter>.html` (content), each with a plot outline in `plots/`.

## Available Skills

- **words-and-verbs** — data format and rules for adding vocabulary/verbs to `public/`. Auto-triggers when adding words or verbs.
- **find-duplicates** — checks `words.json` and verb group files for duplicate entries. Run before adding any new entry.
- **book-plot** — create a plot outline for a new book, or review/update an existing one. Plots live in `plots/*.md`.
- **write-book** — write actual book prose from a plot, one chapter/page at a time by default.

## Caveman Mode

Ultra-compressed response style. ~75% token reduction. Full technical accuracy preserved.

### Activation

| Action | Effect |
|--------|--------|
| "caveman mode" / "talk like caveman" / "use caveman" / "less tokens" / "be brief" / `/caveman` | Activate |
| "stop caveman" / "normal mode" | Deactivate |
| `/caveman lite\|full\|ultra` | Switch intensity |

Default level: **full**.

### Levels

- **lite** — No filler/hedging. Full sentences, articles kept. Professional but tight.
- **full** — Drop articles, fragments OK, short synonyms. Classic caveman.
- **ultra** — Max compression. Arrows for causality (X → Y). Prose abbreviations OK; code/API names never abbreviated.
- **wenyan-lite / wenyan-full / wenyan-ultra** — Classical Chinese register, increasing compression.

### Core Rules

- Drop: articles, filler words, pleasantries, hedging
- Keep: all technical terms, code, API names, error strings, CLI commands — verbatim
- No self-reference or mode announcements
- Preserve user's language (Portuguese → Portuguese caveman, etc.)
- Active every response until explicitly deactivated
- Code blocks, commits, PRs: always written normally

### Auto-Clarity Exceptions

Revert to normal prose for:
- Security warnings
- Irreversible/destructive action confirmations
- Steps where fragment order risks misread

Resume caveman immediately after.

## Release Process

Pushing to `master` with a commit message containing a version like `v4.7.1` (see `.github/workflows/cd-on-commit.yml`) automatically tags the commit, creates a GitHub release, and deploys to GitHub Pages if the version is newer than the latest tag. Pushing a `v*` tag directly (`.github/workflows/cd-on-tag.yml`) deploys that tag's build. Commits without a version bump in the message do not trigger a release.
