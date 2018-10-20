const Discord = require("discord.js");
const auth = require("./auth.json");
const words = require("./words.json");
const winston = require("winston");

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
      "Give me a sentence using the word " + words[date]["Nominative"]
    );

    message.channel.send(wotdEmbed);
  } else {
    message.channel.send("Oops! someone forgot to add more words to the list!");
  }
}

/**
 * handles the given command and executes the bot behaviour
 * @param {string} command
 */
function handleCommands(command) {
  // user entered command "$wotd", send the word of the day in chat
  if (command == "wotd") {
    console.log("Bot sent wotd!");
    logMessage(message);
    sendWord(message);
  }

  // user entered command "$start", starts automatic sending wotd messages
  if (command == "start") {
    if (is_member_mod) {
      console.log("Bot started!");
      logMessage(message);
      sendWord(message);
      interval = bot.setInterval(sendWord, MSEC_PER_DAY, message);
    }
  }

  // user entered command "$stop", stops automatic sending wotd messages
  if (command == "stop") {
    if (is_member_mod) {
      console.log("Bot stopped!");
      logMessage(message);
      bot.clearInterval(interval);
    }
  }

  // thanks user
  if (command == "good bot") {
    logMessage(message);
    message.channel.send("Thanks");
  }

  // woofs user
  if (command == "good boy") {
    logMessage(message);
    message.channel.send("Woof!");
  }

  // help command
  if (command == "help") {
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

  // checks if user is a mod or admin
  const is_member_mod = message.member.roles.some(r =>
    ["Administrator", "Moderators", "Moderator"].includes(r.name)
  );

  // ignore non-command messages
  if (message.content[0] != PREFIX) return;
  let command = message.content.substring(1); // get command string

  // take relevant action according to the given command
  handleCommands(command);
});

bot.login(auth.token);
