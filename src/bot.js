const Discord = require("discord.js");
const auth = require("./auth.json");
const words = require("./words.json");
const winston = require("winston");

// to add this bot: https://discordapp.com/oauth2/authorize?&client_id=493445812412481540&scope=bot&permissions=2048

// Initialize Discord Bot
const bot = new Discord.Client();
const PREFIX = "$";
const MSEC_PER_DAY = 86400000;

const curDate = new Date();
let interval; // interval object for the bot

// initialize logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "../logs/combined.log"
    })
  ]
});

/**
 * sends the word of the day
 * reads from the words.json file
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
      "Give me a sentence using the word " + words[date]["Nominative"]
    );

    message.channel.send(wotdEmbed);
  } else {
    message.channel.send("Oops! someone forgot to add more words to the list!");
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

bot.on("ready", () => {
  console.log("I am ready!");
});

// Bot listens to chat messages, taking action on command
bot.on("message", message => {
  // checks if user has MANAGE_NICKNAMES permissions (which means he is a mod in the estonian channel)
  const is_member_mod = message.member.hasPermission("MANAGE_NICKNAMES");

  // user entered command "$wotd", send the word of the day in chat
  if (message.content.startsWith(`${PREFIX}wotd`)) {
    console.log("Bot sent wotd!");
    logMessage(message);
    sendWord(message);
  }

  // user entered command "$start", starts automatic sending wotd messages
  if (message.content.startsWith(`${PREFIX}start`)) {
    if (is_member_mod) {
      console.log("Bot started!");
      logMessage(message);
      sendWord(message);
      interval = bot.setInterval(sendWord, MSEC_PER_DAY, message);
    }
  }

  // user entered command "$stop", stops automatic sending wotd messages
  if (message.content.startsWith(`${PREFIX}stop`)) {
    if (is_member_mod) {
      console.log("Bot stopped!");
      logMessage(message);
      bot.clearInterval(interval);
    }
  }

  // thank user
  if (message.content.startsWith(`${PREFIX}good bot`)) {
    logMessage(message);
    message.channel.send("Thanks");
  }

  // woofs user
  if (message.content.startsWith(`${PREFIX}good boy`)) {
    logMessage(message);
    message.channel.send("Woof!");
  }

  // help command
  if (message.content.startsWith(`${PREFIX}help`)) {
    let help = "Commands for the word of the day bot:\n";
    help += "```";
    help += "$wotd  - Send the word of the day\n";
    help +=
      "$start - Starts automatic sending the word of the day - once a day, from current time (requires moderator permissions)\n";
    help +=
      "$stop  - Stops automatic sending the word of the day (requires moderator permissions)\n";
    help += "$good bot - Shows your appreciation for the bot\n";
    help += "```";
    message.channel.send(help);
  }
});

bot.login(auth.token);
