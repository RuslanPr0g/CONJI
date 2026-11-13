const tsj = require("ts-json-schema-generator");
const fs = require("fs");

/** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
const typesOptions = {
  path: "src/app/**/models/**/*.model.ts",
  tsconfig: "tsconfig.json",
  type: "*",
};

const configs = [
  {
    outputFileName: "types",
    options: typesOptions,
  },
];

configs.forEach((config) => {
  const schema = tsj
    .createGenerator(config.options)
    .createSchema(config.options.type);
  const schemaString = JSON.stringify(schema, null, 2);
  const outputPath = `schema/generated/${config.outputFileName}.schema.json`;
  fs.writeFile(outputPath, schemaString, (err) => {
    if (err) throw err;
  });
});
