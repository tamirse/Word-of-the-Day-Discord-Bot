const requests = require("request-promise");
const cheerio = require("cheerio"); // Basically jQuery for node.js
const fs = require("fs");

// let $ = cheerio.load(
//   fs.readFileSync(
//     "C:\\Users\\Tamir\\Documents\\node\\Discord_Bot_WOTD\\src\\example.html"
//   )
// );

// $(".tervikart").each((i, elem) => {
//   word[i] = exctract_word_data(cheerio.load(elem));
//   console.log(exctract_word_data(cheerio.load(elem)));
// });

/**
 * scrapes the page for the word data
 * @param {string, word to scrape} word_name
 */
function scrape_word(word_name) {
  const WORD_DIV_CLASS = ".tervikart";
  let word = [];

  const options = {
    uri: `http://www.eki.ee/dict/psv/index.cgi?F=M&Q=${encodeURIComponent(
      word_name
    )}`,
    transform: body => {
      return cheerio.load(body);
    }
  };

  requests(options)
    .then($ => {
      $(WORD_DIV_CLASS).each((i, elem) => {
        console.log(exctract_word_data(cheerio.load(elem)));
        word[i] = exctract_word_data(cheerio.load(elem));
      });
      console.log(`CALLED ON WORD: ${word_name}`);
      console.log(`RESULT: ${word}`);

      save_word_to_file(word);

      const options2 = {
        uri: `http://www.eki.ee/dict/psv/kontekst.cgi?term=${encodeURIComponent(
          word_name
        )}`,
        transform: body => {
          return cheerio.load(body);
        }
      };

      console.log(options2.uri);

      requests(options2)
        .then($ => {
          let next_word = $(".kontekst_leid")
            .next()
            .text()
            .replace(" ", " ");
          console.log(`NEXT WORD IS: ${next_word}`);

          scrape_word(next_word); // recursively call the function on the next word.
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}

/**
 * extract the word data from a cheerio dom object (div with ".tervikart" class)
 * @param {cheerio dom object holding the word data} $
 */
function exctract_word_data($) {
  const WORDNAME_CLASS = ".leitud_ss";
  const HOMONYM_CLASS = ".m_c_i";
  const PART_OF_SPEECH_CLASS = ".sl";
  const PLURAL_CLASS = ".vk";

  let data = {};

  data.word = $(WORDNAME_CLASS).text();
  data.english = "";
  data.homonym = $(HOMONYM_CLASS).text();
  data.is_plural = $(PLURAL_CLASS).text() != "" ? true : false;
  data.part_of_speech = $(PART_OF_SPEECH_CLASS)
    .first()
    .text();
  data.declensions = extract_word_declensions($, data.is_plural);
  data.examples = extract_word_sentences($);

  return data;
}

/**
 * extract the declensions data from a cheerio dom object (div with ".tervikart" class)
 * @param {cheerio dom object holding the word data} $
 */
function extract_word_declensions($, is_plural) {
  const DECLENSION_CLASS = ".mvf";
  const COMPARISON_CLASS = ".kmp";
  const PLURALITY_SEPARATOR_CLASS = ".gkg_c_gkn";
  const PLURALITY_SEPARATOR = "mitmus";
  const COMPARISON_SEPARATOR_CLASS = ".kmpg_c_kmpl";
  const COMPARISON_SEPARATOR = "võrdlus";
  const TYPE_SINGULAR = "singular";
  const TYPE_PLURAL = "plural";
  const TYPE_COMPARISON = "comparison";

  let declensions = {};
  let singular = [];
  let plural = [];
  let comparisons = [];

  let text_type = is_plural ? TYPE_PLURAL : TYPE_SINGULAR; // could be singular/plural/comparison

  // iterate the declensions elements and extract the text
  $(
    `${DECLENSION_CLASS}, ${PLURALITY_SEPARATOR_CLASS}, ${COMPARISON_SEPARATOR_CLASS}, ${COMPARISON_CLASS}`
  ).each((i, elem) => {
    // get the text and format it a bit
    let text = $(elem)
      .text()
      .trim()
      .replace("'", "")
      .replace("`", "")
      .replace("`", "");

    // add to relevant array (sinular word or a plural word)
    if (text == PLURALITY_SEPARATOR) {
      text_type = TYPE_PLURAL; // all words that come after "mitmus" are plural
    } else if (text == COMPARISON_SEPARATOR) {
      text_type = TYPE_COMPARISON; // all words that come after "võrdlus" are comparison types
    } else if (text_type == TYPE_SINGULAR) {
      singular.push(text);
    } else if (text_type == TYPE_PLURAL) {
      plural.push(text);
    } else if (text_type == TYPE_COMPARISON) {
      comparisons.push(text);
    }
  });

  declensions.singular = singular;
  declensions.plural = plural;
  declensions.comparisons = comparisons;

  return declensions;
}

function extract_word_sentences($) {
  const EXAMPLE_SENTENCE_CLASS = ".d";
  const COLLOCATIONS_CLASS = ".kol";
  const COLLOCATIONS_EXAMPLE_SENTENCE_CLASS = ".n";
  const GOVERNMENT_CLASS = ".rek";
  const EXPLANATION_CLASS = ".tp_c_tnr";

  let examples = {};
  let sentences = [];
  let explanations = [];
  let collocations = [];
  let collocations_sentences = [];
  let governments = [];

  let does_contain_explanation =
    $(EXPLANATION_CLASS).text() != "" ? true : false;

  $(`${EXAMPLE_SENTENCE_CLASS}`).each((i, elem) => {
    let text = $(elem).text();
    if (does_contain_explanation) {
      explanations.push(text);
    } else {
      sentences.push(text); // add to relevant array
    }
  });
  $(`${COLLOCATIONS_CLASS}`).each((i, elem) => {
    let text = $(elem).text();
    collocations.push(text); // add to relevant array
  });
  $(`${COLLOCATIONS_EXAMPLE_SENTENCE_CLASS}`).each((i, elem) => {
    let text = $(elem).text();
    collocations_sentences.push(text); // add to relevant array
  });
  $(`${GOVERNMENT_CLASS}`).each((i, elem) => {
    let text = $(elem).text();
    governments.push(text); // add to relevant array
  });

  examples.sentences = sentences;
  examples.explanations = explanations;
  examples.collocations = collocations;
  examples.collocations_sentences = collocations_sentences;
  examples.governments = governments;

  return examples;
}

/**
 * adds the input word to the word file
 * @param {array contains the word and its synonyms if exist} word_arr
 */
function save_word_to_file(word_arr) {
  const FILE_PATH = "dictionary_words2.json";

  fs.readFile(FILE_PATH, (err, data) => {
    let json = JSON.parse(data); // read file contents
    json[word_arr[0].word] = word_arr; // add new word, with key set as word name
    fs.writeFileSync(FILE_PATH, JSON.stringify(json), "utf8"); // save new contents to file
  });
}

scrape_word("rebane");
