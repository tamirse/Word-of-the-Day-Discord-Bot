const auth = require("./auth.json");
const logger = require("./logging.js");
const botMethods = require("./bot_methods.js");

// to add this bot, read: https://discordapp.com/oauth2/authorize?&client_id=493445812412481540&scope=bot&permissions=2048
const bot = botMethods.bot;
const COMMAND_PREFIX = "$"; // the command prefix. ignore all user messages that don't start with the prefix

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
  //logger.logMessage("error", error.message);
});

// Bot listens to chat messages event, taking action on command
bot.on("message", message => {
  // Ignore all bots
  if (message.author.bot) return; 


  // ignore non-command messages
  if (message.content[0] != COMMAND_PREFIX) return;

  if (botMethods.checkIfAdmin(message) == false) return;

  // take relevant action according to the given command
  botMethods.handleCommands(message);
});

bot.login(auth.token);
