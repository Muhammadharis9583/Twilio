const fs = require("fs");

fs.writeFileSync("../public/assets/js/config.js", `export const environment = 'production';`);
