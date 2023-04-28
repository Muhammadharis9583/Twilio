const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "..", "public", "assets", "js", "config.js");
fs.writeFileSync(filePath, `export const environment = 'production';`);
