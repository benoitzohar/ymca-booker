const fs = require("fs");
const { GOOGLE_CREDENTIALS } = process.env;

fs.writeFileSync("./functions/src/google-credentials.json", GOOGLE_CREDENTIALS);
