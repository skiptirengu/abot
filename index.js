'use strict';

process.title = 'arrombot';

const Discordie = require('discordie');
const commands = require('./lib/commands');
const log = require('./lib/log');
const util = require('./lib/util');

process.on('unhandledRejection', log.warn);
const config = require('./config.json');
const client = new Discordie({ autoReconnect: true });

global.arrombot = Object.assign({}, config);
client.connect({ token: config.discord_token });

client.Dispatcher.on('GATEWAY_READY', () => {
  global.arrombot.client = client;
  setTimeout(() => mentionSomeone, 1.2e+6);
  mentionSomeone();
  log.info('Successfully inited the bot!');
});

client.Dispatcher.on('MESSAGE_CREATE', evt => {
  const msg = evt.message;
  // ignore own messages
  if (msg.author.id === client.User.id) return;
  const msgLine = msg.content.split(' ').filter(item => !!item);
  const cmdName = msgLine.shift();
  if (cmdName && commands.hasOwnProperty(cmdName)) {
    const command = commands[cmdName];
    log.info({ tag: util.guildTag(msg.guild), message: `Received command ${cmdName}.` });
    // message instance, command params, client instance
    command.run(msg, msgLine, client).catch(err => {
      const errorMsg = err.toString ? err.toString() : err;
      log.error({ tag: util.guildTag(msg.guild), message: errorMsg });
    });
  }
});

function mentionSomeone() {
  const guild = client.Guilds.get('222761713844355072');
  if (guild) {
    const chan = guild.textChannels.find((chan) => chan.name === 'general');
    if (chan) {
      const user = guild.members[Math.floor(Math.random() * guild.members.length)];
      const tmsg = ['ur mom gay', 'suck my d :tongue: :eggplant:', 'homem moderno'][Math.floor(Math.random() * 3)];
      chan.sendMessage(`@someone ${user.mention} ${tmsg}`).catch(console.error);
    }
  }
}
