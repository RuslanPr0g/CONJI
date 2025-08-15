const fs = require("fs");
const path = require("path");
const jsonminify = require("jsonminify");

const folderPath = path.resolve(__dirname, "public");

const allFiles = fs.readdirSync(folderPath);
for (const file of allFiles) {
  if (file.endsWith(".min.json")) {
    fs.unlinkSync(path.join(folderPath, file));
  }
}

const files = allFiles.filter(
  (f) => f.endsWith(".json") && !f.endsWith(".min.json")
);

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
