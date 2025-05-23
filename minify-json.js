const fs = require("fs");
const path = require("path");
const jsonminify = require("jsonminify");

const folderPath = path.resolve(__dirname, "public");
const files = fs
  .readdirSync(folderPath)
  .filter((f) => /^group-\d+\.json$/.test(f));

for (const file of files) {
  const filePath = path.join(folderPath, file);
  const content = fs.readFileSync(filePath, "utf-8");
  try {
    const minified = jsonminify(content);
    const minFilePath = filePath.replace(/\.json$/, ".min.json");
    fs.writeFileSync(minFilePath, minified, "utf-8");
    console.log(`Minified ${file}`);
  } catch (e) {
    console.error(`Failed to minify ${file}:`, e);
  }
}
