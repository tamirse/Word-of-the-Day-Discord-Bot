const words = require("../src/words.json");
const fs = require("fs");

for (let key in words) {
  words[key][0].didPosted = false;
}

console.log(words);

const FILE_PATH = "../src/words2.json";
fs.writeFileSync(FILE_PATH, JSON.stringify(words), "utf8"); // save new contents to file
