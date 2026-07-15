/**
 * check-book-vocabulary.js
 * Extracts every distinct word used across a book's chapter files and
 * reports which ones are NOT yet covered by public/words.json or by any
 * conjugated form in the verb group files.
 *
 * Usage:
 *   node .claude/skills/write-book/scripts/check-book-vocabulary.js <book-id>
 *   node .claude/skills/write-book/scripts/check-book-vocabulary.js --title "Trenul care nu oprește"
 *   node .claude/skills/write-book/scripts/check-book-vocabulary.js <book-id> --json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../../../public');
const BOOKS_FILE = path.join(ROOT, 'books.json');
const WORDS_FILE = path.join(ROOT, 'words.json');
const VERB_FILES = [
  path.join(ROOT, 'group-1.json'),
  path.join(ROOT, 'group-2.json'),
  path.join(ROOT, 'group-3.json'),
  path.join(ROOT, 'group-4.json'),
];
const CONTENTS_DIR = path.join(ROOT, 'book-contents');

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const titleIndex = args.indexOf('--title');
const titleArg = titleIndex !== -1 ? args[titleIndex + 1] : null;
const idArg = !titleArg ? args.find(a => !a.startsWith('--')) : null;

// ── helpers ──────────────────────────────────────────────────────────────

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalize(str) {
  return str.trim().toLowerCase();
}

// Romanian word tokenizer: letters + diacritics only, drops punctuation/numbers
const WORD_RE = /[a-zA-ZăâîșțĂÂÎȘȚ]+/g;

function extractWords(text) {
  if (!text) return [];
  const matches = text.match(WORD_RE) || [];
  return matches.map(normalize);
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ');
}

// ── book resolution ────────────────────────────────────────────────────────

function resolveBook() {
  const books = readJson(BOOKS_FILE);
  let book;

  if (titleArg) {
    book = books.find(b => normalize(b.title) === normalize(titleArg));
  } else if (idArg) {
    book = books.find(b => b.id === idArg);
  }

  if (!book) {
    console.error('Usage:');
    console.error('  node check-book-vocabulary.js <book-id>');
    console.error('  node check-book-vocabulary.js --title "Book Title"');
    console.error('\nAvailable books:');
    books.forEach(b => console.error(`  ${b.id}  ${b.title}`));
    process.exit(1);
  }

  return book;
}

// ── word collection ─────────────────────────────────────────────────────────

function collectBookWords(book) {
  const dir = path.join(CONTENTS_DIR, book.id);
  const files = fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.html'))
    .sort((a, b) => parseInt(a) - parseInt(b));

  const wordCounts = new Map();

  files.forEach(file => {
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    extractWords(stripHtml(html)).forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
  });

  return { wordCounts, fileCount: files.length };
}

function collectKnownVocabulary() {
  const known = new Set();

  const words = readJson(WORDS_FILE);
  words.forEach(entry => {
    extractWords(entry.value).forEach(w => known.add(w));
  });

  VERB_FILES.forEach(filePath => {
    const data = readJson(filePath);
    (data.verbs || []).forEach(verb => {
      extractWords(verb.infinitive).forEach(w => known.add(w));
      const conjugations = verb.conjugations || {};
      Object.values(conjugations).forEach(tenseForms => {
        Object.values(tenseForms || {}).forEach(form => {
          extractWords(form).forEach(w => known.add(w));
        });
      });
    });
  });

  return known;
}

// ── main ─────────────────────────────────────────────────────────────────

const book = resolveBook();
const { wordCounts, fileCount } = collectBookWords(book);
const known = collectKnownVocabulary();

const missing = [];
wordCounts.forEach((count, word) => {
  if (!known.has(word)) missing.push({ word, count });
});
missing.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

if (asJson) {
  console.log(
    JSON.stringify(
      {
        book: { id: book.id, title: book.title },
        chapterFiles: fileCount,
        distinctWords: wordCounts.size,
        missing,
      },
      null,
      2
    )
  );
  process.exit(missing.length > 0 ? 1 : 0);
}

console.log(`\n📖 Vocabulary coverage — "${book.title}"`);
console.log(`   ${fileCount} chapter file(s), ${wordCounts.size} distinct word(s)\n`);

if (missing.length === 0) {
  console.log('✅ Every word in this book is already covered by words.json or the verb groups.\n');
  process.exit(0);
}

console.log(`⚠️  ${missing.length} word(s) not covered by words.json or the verb groups:\n`);
missing.forEach(({ word, count }) => {
  console.log(`  ${word}  (×${count})`);
});
console.log(
  '\nReview this list against public/words.json and group-N.json. Some entries may be' +
    ' proper nouns, or conjugated verb forms this script did not match — add real vocabulary' +
    ' via the words-and-verbs skill (run find-duplicates first).\n'
);
process.exit(1);
