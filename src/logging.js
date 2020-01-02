const winston = require("winston"); // used for logging

/**
 * Initialize logger
 */
function initLogger(){
  return winston.createLogger({
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
}

/**
 * logs the message to the logfile
 * @param {Message} discord_message
 */
function logMessage(discord_message) {
  let logger = initLogger();
  let curDate = new Date();

  logger.log({
    level: "info",
    message: discord_message.content,
    member: discord_message.member.displayName,
    channel: discord_message.channel.name,
    time: curDate.toString()
  });
}

module.exports = {
    logMessage: logMessage
}