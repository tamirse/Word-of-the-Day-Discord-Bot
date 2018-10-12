const Discord = require("discord.js");
const auth = require("./auth.json");
const words = require("./words.json");

// Initialize Discord Bot
const bot = new Discord.Client();
const PREFIX = "!";

const curDate = new Date();

bot.on("ready", () => {
  console.log("I am ready!");
});

/**
 * sends the word of the day
 * @param {*} message
 */
function sendWord(message) {
  let date = curDate.toLocaleDateString().replace(/-/g, "_");

  // if word exists for today, format it (using discord's rich embed) and send in chat
  if (words[date]) {
    const wotdEmbed = new Discord.RichEmbed()
      .setColor("#0099ff")
      .setTitle("__WORD OF THE DAY__: " + words[date]["Nominative"]);

    // Add the word's english translation + 5 cases
    for (let key in words[date]) {
      let inline = key == "Notes" ? false : true;
      let value = words[date][key] ? words[date][key] : " ";
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

// Bot listens to chat messages, taking action on command
bot.on("message", message => {
  // user entered command "!wotd", send the word of the day in chat
  if (message.content.startsWith(`${PREFIX}wotd`)) {
    sendWord(message);
    try {
      console.log(bot.channels);
      console.log(bot.guilds);
    } catch (error) {
      console.log(error);
    }
  }
});

bot.login(auth.token);
