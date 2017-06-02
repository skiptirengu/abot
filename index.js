const Discordie = require("discordie");
const commands = require('./lib/commands');
const log = require('./lib/log');

const config = require('./config.json');
const client = new Discordie({autoReconnect: true});

global.arrombot = Object.assign({}, config);
client.connect({token: config.discord_token});

client.Dispatcher.on('MESSAGE_CREATE', evt => {
  const msg = evt.message;
  const msgLine = msg.content.split(' ');
  const cmdName = msgLine.shift();
  if (cmdName && commands.hasOwnProperty(cmdName)) {
    const command = commands[cmdName];
    // message instance, command params, client instance
    command.run(msg, msgLine, client).catch(log.error);
  }
});
