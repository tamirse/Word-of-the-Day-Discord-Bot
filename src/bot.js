const Discord = require("discord.js");
const auth = require("./auth.json");
const words = require("./words2.json");
const dictionaryWords = require("./dictionary_words_um.json");
const logger = require("./logging.js")
const fs = require("fs"); // file handling

// to add this bot, read: https://discordapp.com/oauth2/authorize?&client_id=493445812412481540&scope=bot&permissions=2048

// initialize Discord Bot and set the command prefix
const bot = new Discord.Client();
const PREFIX = "$";
const MSEC_PER_DAY = 86400000;

let curDate = new Date();
let interval; // interval object for the bot. we declare it here so it would be in the global scope

/**
 * capitalizes the first letter of the string
 * @param {string} string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * sends the word of the day
 * reads from the words.json file then uses the message object to send the message to the channel
 * sends the message as a discord rich embed format (this is just a fancy looking message)
 * @param {Message} message
 */
function sendWordOfTheDay(message, updateWordStatus = false) {
  let words = JSON.parse(fs.readFileSync("./words2.json", "utf8"));
  let word = null;

  // get word
  for (const key in words) {
    if (words[key][0].didPosted === false) {
      word = words[key][0];
      delete word.didPosted;
      words[key][0].didPosted = true; // set as true
      break;
    }
  }

  // if word exists, format it (using discord's rich embed) and send in chat
  if (word != null) {
    sendCustomWord(message, word.word, isWotd=true);
    if (updateWordStatus === true) {
      // set the word as didPosted in the file
      saveWords(words);
    }
  } else {
    message.channel.send("Oops! someone forgot to add more words to the list!");
    return;
  }
}

/**
 * send a word to the channel
 * @param {Message} message
 * @param {word object} word
 * @param {isWotd} isWotd
 */
function sendCustomWord(message, word, isWotd=false) {
  let wordObj = null;

  if (words[word]) {
    wordObj = words[word];
  } else if (dictionaryWords[word]) {
    wordObj = dictionaryWords[word];
  }

  if (wordObj != null) {
    const wotdEmbed = new Discord.RichEmbed()
      .setColor("#0099ff")
    
    if (isWotd) {
      wotdEmbed.setTitle("__WORD OF THE DAY__: " + wordObj[0]["word"]);
    }

    // Add the word's english translation + any other data that exists
    for (let homonym in wordObj) {
      let wordObject = wordObj[homonym];

      for (let key in wordObject) {
        let inline = key == "Notes" ? false : true;
        let value = wordObject[key] ? wordObject[key] : "\u200b";

        // ignore "homonym" and "is_plural" fields
        switch (key) {
          case "word":
          case "part_of_speech":
            value = capitalizeFirstLetter(value)
            break;
          case "homonym":
          case "is_plural":
          case "didPosted":
            continue;
        }

        // value has sub-objects
        if (typeof value == "object") {
          for (wordField in value) {
            let subfieldVal =
              value[wordField].length > 0 ? value[wordField].slice() : "\u200b";
            console.log("key: ", wordField);
            console.log("value: ", subfieldVal);

            switch (wordField) {
              case "singular":
              case "plural":
                subfieldVal[0] = "(Nom): " + subfieldVal[0]
                subfieldVal[1] = "(Gen):   " + subfieldVal[1]
                subfieldVal[2] = "(Par):   " + subfieldVal[2]
                break;
            }

            wotdEmbed.addField(
              capitalizeFirstLetter(wordField) + ":",
              subfieldVal,
              inline
            );
          }
        } else {
          wotdEmbed.addField(capitalizeFirstLetter(key) + ":", value, inline);
        }
      }

      if (isWotd) {
        wotdEmbed.addField(
          "\u200b",
          `Give me a sentence using the word ${wordObject["word"]}!`
        );
      }
      
      message.channel.send(wotdEmbed);
    }
  } else {
    message.channel.send("Oops! no such word!");
  }
}

/**
 * saves the words json into a file
 * @param {words} words json of words
 */
function saveWords(words) {
  const FILE_PATH = "./words2.json";
  fs.writeFileSync(FILE_PATH, JSON.stringify(words), "utf8"); // save new contents to file
}

/**
 * handles the given command and executes the bot behaviour
 * @param {string} command
 */
function handleCommands(message) {
  let command = message.content.split(" ")[0].substring(1); // get command string
  console.log(command);

  // checks if user is a mod or admin
  let is_member_mod = true;
  if (message.member != null) { // member field is null if this is a private message
      is_member_mod = message.member.roles.some(r =>
      ["Administrator", "Moderators", "Moderator"].includes(r.name)
    );
  }
  

  // user entered command "$wotd", send the word of the day in chat
  if (command == "wotd") {
    console.log("Bot sent wotd!");
    logger.logMessage(message);
    sendWordOfTheDay(message);
  }

  // user entered command "$word x", get the word from the dictionary and send it
  if (command == "word") {
    const word = message.content.split(" ")[1];
    console.log(`Bot sent word! ${word}`);
    sendCustomWord(message, word);
  }

  // user entered command "$start", starts automatic sending wotd messages and updates word status
  if (command == "start") {
    if (is_member_mod) {
      console.log("Bot started!");
      logger.logMessage(message);
      message.channel.send(
        "Bot started! A new word will be posted every 24h from now."
      );
      sendWordOfTheDay(message, true);
      interval = bot.setInterval(sendWordOfTheDay, MSEC_PER_DAY, message, true);
    } else {
      console.log("Bot did not start, user was not a moderator or admin");
      logger.logMessage(message);
      message.channel.send(
        "Bot did not start, user must be a moderator or admin to use this command."
      );
    }
  }

  // user entered command "$stop", stops automatic sending wotd messages
  if (command == "stop") {
    if (is_member_mod) {
      console.log("Bot stopped!");
      logger.logMessage(message);
      message.channel.send(
        "Bot stopped! New words will not be posted automatically."
      );
      bot.clearInterval(interval);
    } else {
      console.log("Bot did not stop, user was not a moderator or admin");
      logger.logMessage(message);
      message.channel.send(
        "Bot did not stop, user must be a moderator or admin to use this command."
      );
    }
  }

  // thanks user
  if (command == "goodbot") {
    console.log("Bot was a good bot!");
    logger.logMessage(message);
    message.channel.send("Thanks");
  }

  // woofs user
  if (command == "goodboy") {
    console.log("Bot was a good boy!");
    logger.logMessage(message);
    message.channel.send("Woof!");
  }

  // help command
  if (command == "help") {
    console.log("Bot helped!");
    let help = "Commands for the word of the day bot:\n";
    help += "```";
    help +=
      "$word x  - Searches word x in the dictionary and posts it if available\n";
    help +=
      "$start - Starts automatic sending the word of the day - once a day, from current time (requires moderator permissions)\n";
    help +=
      "$stop  - Stops automatic sending the word of the day (requires moderator permissions)\n";
    help += "$goodbot - Shows your appreciation for the bot\n";
    help += "$goodboy - Woof!\n";
    help += "```";
    message.channel.send(help);
  }
}

// indicate the bot has logged in successfully by writing to the console
bot.on("ready", () => {
  console.log(
    `Word of the Day bot has started, with ${bot.users.size} users, in ${
      bot.channels.size
    } channels of ${bot.guilds.size} guilds.`
  );
  console.log("I am ready!");
});

// logs bot errors to the error log file
bot.on("error", error => {
  logger.log("error", error.message);
});

// Bot listens to chat messages event, taking action on command
bot.on("message", message => {
  // get current date
  curDate = new Date();

  // Ignore all bots
  if (message.author.bot) return;

  // ignore non-command messages
  if (message.content[0] != PREFIX) return;

  // take relevant action according to the given command
  handleCommands(message);
});

bot.login(auth.token);
