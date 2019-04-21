const fs = require("fs"); // file handling

/**
 * capitalizes the first letter of the string
 * @param {string} string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * saves the object to json file
 * @param {object} json json of words
 * @param {string} filepath words json file path
 */
function saveToJSONFile(json, filepath) {
    fs.writeFileSync(filepath, JSON.stringify(json), "utf8"); // save new contents to file
}

module.exports = {
    capitalizeFirstLetter : capitalizeFirstLetter,
    saveToJSONFile : saveToJSONFile
}