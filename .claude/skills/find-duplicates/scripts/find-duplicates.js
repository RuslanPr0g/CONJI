/**
 * find-duplicates.js
 * Scans words.json and group-1..4.json for duplicate entries.
 *
 * Usage:
 *   node .claude/skills/find-duplicates/scripts/find-duplicates.js
 *   node .claude/skills/find-duplicates/scripts/find-duplicates.js --words-only
 *   node .claude/skills/find-duplicates/scripts/find-duplicates.js --verbs-only
 *   node .claude/skills/find-duplicates/scripts/find-duplicates.js --check "merg"
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../../../public');

const WORDS_FILE = path.join(ROOT, 'words.json');
const VERB_FILES = [
  path.join(ROOT, 'group-1.json'),
  path.join(ROOT, 'group-2.json'),
  path.join(ROOT, 'group-3.json'),
  path.join(ROOT, 'group-4.json'),
];

const args = process.argv.slice(2);
const wordsOnly = args.includes('--words-only');
const verbsOnly = args.includes('--verbs-only');
const checkIndex = args.indexOf('--check');
const checkValue = checkIndex !== -1 ? args[checkIndex + 1] : null;

// ── helpers ────────────────────────────────────────────────────────────────

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`  ✗ Could not read ${filePath}: ${e.message}`);
    process.exit(1);
  }
}

function normalize(str) {
  return str.trim().toLowerCase();
}

// ── words.json duplicates ──────────────────────────────────────────────────

function checkWordsDuplicates() {
  const words = readJson(WORDS_FILE);
  const seen = new Map(); // normalized value → [indices]
  const dupes = [];

  words.forEach((entry, i) => {
    const key = normalize(entry.value);
    if (!seen.has(key)) {
      seen.set(key, []);
    }
    seen.get(key).push(i + 1); // 1-based line hint
  });

  seen.forEach((indices, key) => {
    if (indices.length > 1) {
      dupes.push({ value: key, occurrences: indices.length, entries: indices });
    }
  });

  return { total: words.length, dupes, seen };
}

// ── verb group duplicates ──────────────────────────────────────────────────

function checkVerbDuplicates() {
  const allVerbs = new Map(); // normalized infinitive → [{ file, index }]
  const dupes = [];

  VERB_FILES.forEach(filePath => {
    const data = readJson(filePath);
    const verbs = data.verbs || [];
    const shortName = path.basename(filePath);

    verbs.forEach((verb, i) => {
      const key = normalize(verb.infinitive);
      if (!allVerbs.has(key)) {
        allVerbs.set(key, []);
      }
      allVerbs.get(key).push({ file: shortName, index: i + 1 });
    });
  });

  allVerbs.forEach((locations, key) => {
    if (locations.length > 1) {
      dupes.push({ infinitive: key, locations });
    }
  });

  return { dupes, seen: allVerbs };
}

// ── single-value check ─────────────────────────────────────────────────────

function checkSingleValue(value) {
  const key = normalize(value);
  const results = { words: [], verbs: [] };

  const words = readJson(WORDS_FILE);
  words.forEach((entry, i) => {
    if (normalize(entry.value) === key) {
      results.words.push({ index: i + 1, entry });
    }
  });

  VERB_FILES.forEach(filePath => {
    const data = readJson(filePath);
    const verbs = data.verbs || [];
    const shortName = path.basename(filePath);
    verbs.forEach((verb, i) => {
      if (normalize(verb.infinitive) === key) {
        results.verbs.push({ file: shortName, index: i + 1, verb });
      }
    });
  });

  return results;
}

// ── output ─────────────────────────────────────────────────────────────────

function printSection(title, content) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(` ${title}`);
  console.log('─'.repeat(60));
  console.log(content);
}

// ── main ───────────────────────────────────────────────────────────────────

console.log('\n🔍 CONJI Duplicate Checker\n');

if (checkValue) {
  const result = checkSingleValue(checkValue);
  const found = result.words.length + result.verbs.length;

  if (found === 0) {
    console.log(`✅ "${checkValue}" — not found anywhere. Safe to add.`);
  } else {
    console.log(`⚠️  "${checkValue}" already exists:\n`);
    if (result.words.length) {
      console.log('  In words.json:');
      result.words.forEach(w => {
        console.log(`    [entry ${w.index}] ${JSON.stringify(w.entry)}`);
      });
    }
    if (result.verbs.length) {
      console.log('  In verb groups:');
      result.verbs.forEach(v => {
        console.log(`    [${v.file}, entry ${v.index}] infinitive: "${v.verb.infinitive}"`);
      });
    }
  }
  process.exit(found > 0 ? 1 : 0);
}

let hasAnyDupe = false;

if (!verbsOnly) {
  const { total, dupes } = checkWordsDuplicates();

  if (dupes.length === 0) {
    printSection(`words.json  (${total} entries)`, '  ✅ No duplicates found.');
  } else {
    hasAnyDupe = true;
    printSection(`words.json  (${total} entries) — ${dupes.length} duplicate(s)`, '');
    dupes.forEach(d => {
      console.log(`  ⚠️  "${d.value}"  ×${d.occurrences}  (entries: ${d.entries.join(', ')})`);
    });
  }
}

if (!wordsOnly) {
  const { dupes } = checkVerbDuplicates();

  if (dupes.length === 0) {
    printSection('Verb groups (group-1..4.json)', '  ✅ No duplicate infinitives found.');
  } else {
    hasAnyDupe = true;
    printSection(`Verb groups — ${dupes.length} duplicate(s)`, '');
    dupes.forEach(d => {
      const locs = d.locations.map(l => `${l.file}[${l.index}]`).join(', ');
      console.log(`  ⚠️  "${d.infinitive}"  →  ${locs}`);
    });
  }
}

console.log('\n' + '─'.repeat(60));
if (hasAnyDupe) {
  console.log(' ❌ Duplicates found. Review before adding new entries.\n');
  process.exit(1);
} else {
  console.log(' ✅ All clear.\n');
  process.exit(0);
}
