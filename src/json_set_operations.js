const wordMethods = require("./word_methods.js");

/**
 * the A \ B set operation for json files.
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
 * calculates the complement of A \ B and saves the result at filePath
 * @param {object} universalSetJSON // universal set (A)
 * @param {object} subSetJSON // subset (B)
 * @param {string} filePath // file path to save the result
 */
function getAndSaveComplement(universalSetJSON, subSetJSON, filePath){
    let complementSetJSON = getComplement(universalSetJSON, subSetJSON);
    wordMethods.saveToJSONFile(complementSetJSON, filePath)
}

// test:
// const allWords = require("./data/dictionary_words_um.json");
// const someWords = require("./data/words2.json");

// getAndSaveComplement(allWords, someWords, "./data/allWordsWithoutPreviousWOTDWords.json");