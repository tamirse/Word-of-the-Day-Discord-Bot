const wiktionary_node = require("wiktionary-node");
//const wiktionary_node = require("../../wiktionary-node-fork/wiktionary-node/src/wikientry");
const dictionaryWords = require("./data/dictionary_words_um.json"); // contains all words
const jsonMethods = require("./json_methods");

const getWordDefinitions = result => {
  let definitions = "";
  result.definitions[0].lines.map(word => (definitions += `${word.define}, `));
  definitions = definitions.slice(0, -2);

  return definitions;
};

// extract translations
let promises = [];

Object.keys(dictionaryWords).forEach(word => {
  promises.push(
    wiktionary_node(word, "Estonian")
      .then(result => {
        let definitions = getWordDefinitions(result);
        dictionaryWords[word][0].english = definitions;

        console.log(word, dictionaryWords[word][0].english);
      })
      .catch(err => {})
  );
});

// save to files
Promise.all(promises)
  .then(() => {
    console.log("all promises resolved!");

    jsonMethods.saveOnlyTranslatedWords(
      dictionaryWords,
      "./data/dictionary_words_um_translated_MOST_WORDS.json"
    );

    jsonMethods.addDidPostedFieldAndSave(
      dictionaryWords,
      "./data/dictionary_wordsRound4.json"
    );
  })
  .catch(error => console.log(error));
