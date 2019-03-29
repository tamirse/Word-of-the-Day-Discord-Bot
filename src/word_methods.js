const fs = require("fs"); // file handling

/**
 * capitalizes the first letter of the string
 * @param {string} string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


  /**
 * saves the words json into a file
 * @param {words} words json of words
 */
function saveWords(words) {
    const FILE_PATH = "./words2.json";
    fs.writeFileSync(FILE_PATH, JSON.stringify(words), "utf8"); // save new contents to file
}

module.exports = {
    capitalizeFirstLetter : capitalizeFirstLetter,
    saveWords : saveWords
}