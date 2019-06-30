const fs = require("fs"); // file handling

/**
 * Saves the object to json file
 * @param {object} json json of words
 * @param {string} filepath words json file path
 */
function saveToJSONFile(json, filepath) {
    fs.writeFileSync(filepath, JSON.stringify(json), "utf8"); // save new contents to file
}

/**
 * The A \ B set operation for json files. (aka filter)
 * return the complement of subSetJSON in universalSetJSON 
 * (items in universalSetJSON that are not in subSetJSON)
 * 
 * we say that element e is in A if A contains a key:value pair such that key = e
 * @param {json} universalSetJSON // universal set (A)
 * @param {json} subSetJSON       // subset (B)
 */
function getComplement(universalSetJSON, subSetJSON){
    let complementSetJSON = {}

    let subSetKeys       = Object.keys(subSetJSON)       // get subset keys
    let universalSetKeys = Object.keys(universalSetJSON) // get universal set keys

    // for every key in universal set, if it's not in subset, add its' value to the complement set
    universalSetKeys.forEach(key => {
        if (!(subSetKeys.includes(key))) {
            complementSetJSON[key] = universalSetJSON[key]
        }
    });

    return complementSetJSON
}

/**
 * Calculates the complement of A \ B and saves the result at filePath
 * @param {object} universalSetJSON // universal set (A)
 * @param {object} subSetJSON // subset (B)
 * @param {string} filePath // file path to save the result
 */
function getAndSaveComplement(universalSetJSON, subSetJSON, filePath){
    let complementSetJSON = getComplement(universalSetJSON, subSetJSON);
    saveToJSONFile(complementSetJSON, filePath)
}

/**
 * Delete words without english translation and save to file
 * @param {object} json 
 * @param {string} filePath 
 */
function saveOnlyTranslatedWords(json, filePath){
    for (const key in json) {
        let englishTranslation = json[key][0].english
        
        if (englishTranslation === "") {
            delete json[key]
        }
    }
    saveToJSONFile(json, filePath)
}

/**
 * Copy the english word translation from one json file to the other
 * returns the JSON the words were copied into (toJSON)
 * @param {object} toJSON 
 * @param {object} fromJSON 
 */
function copyWordsTranslation(toJSON, fromJSON){
    for (const key in fromJSON) {
        let englishTranslation = fromJSON[key][0].english
        
        if (englishTranslation !== "") {
            toJSON[key][0].english = englishTranslation
        }
    }

    return toJSON;
}

/**
 * Copy the english word translation from one json file to the other, then save at filepath
 * @param {object} toJSON 
 * @param {object} fromJSON 
 * @param {string} filePath 
 */
function copyAndSaveWordsTranslation(toJSON, fromJSON, filePath){
    let jsonAfterTranslation = copyWordsTranslation(toJSON, fromJSON);
    saveToJSONFile(jsonAfterTranslation, filePath)
}

/**
 * Adds the "didPosted field" to every word, with the default value of 'false'
 * and then saves to file
 * @param {object} json 
 * @param {string} filePath 
 */
function addDidPostedFieldAndSave(json, filePath){
    for (const key in json) {
        for (const i in json[key]) {
            json[key][i]["didPosted"] = false
        }
    }
    saveToJSONFile(json, filePath)
}

module.exports = {
    saveToJSONFile : saveToJSONFile
}

// test:
const allWords = require("./data/dictionary_words_um.json");
// const someWords = require("./data/words2.json");

const TRANSLATED_WORDS_PATH = "./data/wordsRound3_someTranslated.json"
const translatedWords = require(TRANSLATED_WORDS_PATH)
// getAndSaveComplement(allWords, someWords, "./data/allWordsWithoutPreviousWOTDWords.json");
// copyWordsTranslation(allWords, translatedWords)
// copyAndSaveWordsTranslation(allWords, translatedWords, "./data/dictionary_words_um_translated.json")

// addDidPostedFieldAndSave(translatedWords, "./data/translatedWordsRound3.json")
// saveOnlyTranslatedWords(translatedWords, "./data/wordsRound3_onlyTranslated.json")