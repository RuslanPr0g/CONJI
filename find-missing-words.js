const fs = require("fs");
const path = require("path");

const publicDir = path.resolve(__dirname, "public");
const wordRegex = /[\p{L}\p{M}'’-]+/gu;

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ");
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(publicDir, file), "utf-8"));
}

function buildDictionary() {
  const words = loadJson("words.json");
  const groupFiles = ["group-1.json", "group-2.json", "group-3.json", "group-4.json"];
  const verbGroups = groupFiles.map(loadJson);

  const dict = new Set();

  words.forEach((w) => {
    if (w.value && w.translations?.length) {
      dict.add(w.value.toLowerCase());
    }
  });

  verbGroups.forEach((group) => {
    group.verbs.forEach((verb) => {
      if (verb.infinitive && verb.infinitive_translated?.length) {
        dict.add(verb.infinitive.toLowerCase());
      }

      if (verb.conjugations) {
        Object.values(verb.conjugations).forEach((tense) => {
          Object.values(tense).forEach((form) => {
            const formParts = form.split(" ");
            formParts.forEach((_, index) => {
              dict.add(formParts.slice(index).join(" ").toLowerCase());
            });
          });
        });
      }
    });
  });

  return dict;
}

function getBooks(filterId) {
  const books = loadJson("books.json");
  if (!filterId) return books;
  const book = books.find((b) => b.id === filterId);
  if (!book) {
    console.error(`No book found with id "${filterId}"`);
    process.exit(1);
  }
  return [book];
}

function main() {
  const filterId = process.argv[2];
  const dict = buildDictionary();
  const books = getBooks(filterId);

  const missing = new Map();

  books.forEach((book) => {
    for (let page = 1; page <= book.content_length; page++) {
      const filePath = path.join(publicDir, "book-contents", book.id, `${page}.html`);
      if (!fs.existsSync(filePath)) {
        console.warn(`Missing chapter file: ${filePath}`);
        continue;
      }

      const html = fs.readFileSync(filePath, "utf-8");
      const text = stripHtml(html);
      const tokens = text.match(wordRegex) || [];

      tokens.forEach((token) => {
        const key = token.toLowerCase();
        if (dict.has(key)) return;

        if (!missing.has(key)) {
          missing.set(key, { word: key, occurrences: [] });
        }
        const entry = missing.get(key);
        const location = `${book.title} (p.${page})`;
        if (!entry.occurrences.includes(location)) {
          entry.occurrences.push(location);
        }
      });
    }
  });

  const result = Array.from(missing.values()).sort((a, b) =>
    a.word.localeCompare(b.word, "ro")
  );

  const outPath = path.resolve(__dirname, "missing.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");

  console.log(`Found ${result.length} untranslated word(s). Written to ${outPath}`);
}

main();
