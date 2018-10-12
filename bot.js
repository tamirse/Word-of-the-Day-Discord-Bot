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

bot.on("message", message => {
  if (message.content.startsWith(`${PREFIX}wotd`)) {
    let date = curDate.toLocaleDateString().replace(/-/g, "_");

    if (words[date]) {
      const wotdEmbed = new Discord.RichEmbed()
        .setColor("#0099ff")
        .setTitle("__WORD OF THE DAY__: " + words[date]["Nominative"]);

      // Add the word english translation + 5 cases
      for (let key in words[date]) {
        wotdEmbed.addField(key + ":", words[date][key], true);
      }

      wotdEmbed.addField(
        "\u200b",
        "Give me a sentence using the word " + words[date]["Nominative"]
      );

      message.channel.send(wotdEmbed);
      message.channel.send(message.channel.toString());
    } else {
      message.channel.send(
        "Oops! someone forgot to add more words to the list!"
      );
    }
  }
});

bot.login(auth.token);
