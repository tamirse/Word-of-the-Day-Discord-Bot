const Discord = require("discord.js");
const auth = require("./auth.json");
const words = require("./words.json");
const dictWords = require("./dictionary_words_um.json");
const winston = require("winston"); // used for logging

// to add this bot: https://discordapp.com/oauth2/authorize?&client_id=493445812412481540&scope=bot&permissions=2048

// initialize Discord Bot, the command prefix
const bot = new Discord.Client();
const PREFIX = "$";
const MSEC_PER_DAY = 86400000;

let curDate = new Date();
let interval; // interval object for the bot. we declare it here so it would be in the global scope

// initialize logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "../logs/combined.log"
    }),
    new winston.transports.File({
      filename: "../logs/error.log",
      level: "error"
    })
  ]
});

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
function sendWord(message) {
  let date = curDate.toLocaleDateString().replace(/-/g, "_"); // get current date

  // if word exists for today, format it (using discord's rich embed) and send in chat
  if (words[date]) {
    const wotdEmbed = new Discord.RichEmbed()
      .setColor("#0099ff")
      .setTitle("__WORD OF THE DAY__: " + words[date]["Nominative"]);

    // Add the word's english translation + 5 cases
    for (let key in words[date]) {
      let inline = key == "Notes" ? false : true;
      let value = words[date][key] ? words[date][key] : "\u200b";
      wotdEmbed.addField(key + ":", value, inline);
    }

    wotdEmbed.addField(
      "\u200b",
      `Give me a sentence using the word ${words[date]["Nominative"]}!`
    );

    message.channel.send(wotdEmbed);
  } else {
    message.channel.send("Oops! someone forgot to add more words to the list!");
  }
}

function sendCustomWord(message, word) {
  if (dictWords[word]) {
    const wotdEmbed = new Discord.RichEmbed()
      .setColor("#0099ff")
      .setTitle("__WORD OF THE DAY__: " + dictWords[word][0]["word"]);

    // Add the word's english translation + other data
    for (let homonym in dictWords[word]) {
      let wordObject = dictWords[word][homonym];

      for (let key in wordObject) {
        let inline = key == "Notes" ? false : true;
        let value = wordObject[key] ? wordObject[key] : "\u200b";

        if (typeof value == "object") {
          for (anotherKey in value) {
            let val =
              value[anotherKey].length > 0 ? value[anotherKey] : "\u200b";
            console.log(val);
            wotdEmbed.addField(
              capitalizeFirstLetter(anotherKey) + ":",
              val,
              inline
            );
          }
        } else {
          wotdEmbed.addField(capitalizeFirstLetter(key) + ":", value, inline);
        }
      }

      wotdEmbed.addField(
        "\u200b",
        `Give me a sentence using the word ${wordObject["word"]}!`
      );
      message.channel.send(wotdEmbed);
    }
  } else {
    message.channel.send("Oops! no such word!");
  }
}

/**
 * handles the given command and executes the bot behaviour
 * @param {string} command
 */
function handleCommands(message) {
  let command = message.content.split(" ")[0].substring(1); // get command string
  console.log(command);

  // checks if user is a mod or admin
  const is_member_mod = message.member.roles.some(r =>
    ["Administrator", "Moderators", "Moderator"].includes(r.name)
  );

  // user entered command "$wotd", send the word of the day in chat
  if (command == "wotd") {
    console.log("Bot sent wotd!");
    logMessage(message);
    sendWord(message);
  }

  // user entered command "$getword x", get the word from the dictionary and send it
  if (command == "word") {
    const word = message.content.split(" ")[1];
    console.log(`Bot sent word! ${word}`);
    sendCustomWord(message, word);
  }

  // user entered command "$start", starts automatic sending wotd messages
  if (command == "start") {
    if (is_member_mod) {
      console.log("Bot started!");
      logMessage(message);
      message.channel.send(
        "Bot started! A new word will be posted every 24h from now."
      );
      sendWord(message);
      interval = bot.setInterval(sendWord, MSEC_PER_DAY, message);
    } else {
      console.log("Bot did not start, user was not a moderator or admin");
      logMessage(message);
      message.channel.send(
        "Bot did not start, user must be a moderator or admin to use this command."
      );
    }
  }

  // user entered command "$stop", stops automatic sending wotd messages
  if (command == "stop") {
    if (is_member_mod) {
      console.log("Bot stopped!");
      logMessage(message);
      message.channel.send(
        "Bot stopped! New words will not be posted automatically."
      );
      bot.clearInterval(interval);
    } else {
      console.log("Bot did not stop, user was not a moderator or admin");
      logMessage(message);
      message.channel.send(
        "Bot did not stop, user must be a moderator or admin to use this command."
      );
    }
  }

  // thanks user
  if (command == "goodbot") {
    console.log("Bot was a good bot!");
    logMessage(message);
    message.channel.send("Thanks");
  }

  // woofs user
  if (command == "goodboy") {
    console.log("Bot was a good boy!");
    logMessage(message);
    message.channel.send("Woof!");
  }

  // help command
  if (command == "help") {
    console.log("Bot helped!");
    let help = "Commands for the word of the day bot:\n";
    help += "```";
    help += "$wotd  - Send the word of the day\n";
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

/**
 * logs the message to the logfile
 * @param {Message} discord_message
 */
function logMessage(discord_message) {
  logger.log({
    level: "info",
    message: discord_message.content,
    member: discord_message.member.displayName,
    channel: discord_message.channel.name,
    time: curDate.toString()
  });
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

// logs error to the error log file
bot.on("error", error => {
  logger.log("error", error.message);
});

// Bot listens to chat messages, taking action on command
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
