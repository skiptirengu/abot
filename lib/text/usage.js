'use strict';

const { wrapCode, randomColor } = require('./../util');

module.exports = {
  run: function (msg, params) {
    const commands = require('./../commands');
    let cmdName = params.pop();

    if (!cmdName) {
      return msg.channel.sendMessage(wrapCode('You should specify a command name.'));
    }
    if (cmdName[0] !== '!') {
      cmdName = `!${cmdName}`;
    }

    if (!commands.hasOwnProperty(cmdName)) {
      return msg.channel.sendMessage(wrapCode('This command does not exist.'));
    }

    const command = commands[cmdName];
    if (typeof command.usage !== 'function') {
      return msg.channel.sendMessage(wrapCode('This command does not have a usage example.'));
    }

    const usage = command.usage();
    if (!usage.color) usage.color = randomColor();
    usage.title = usage.title ? `${cmdName} ${usage.title}` : cmdName;
    return msg.channel.sendMessage('', false, usage);
  },

  usage: function () {
    return {
      title: '<command>',
      description: 'It does ***EXACTLY*** what you think it does.',
      fields: [
        { name: 'Example:', value: '`!usage usage`', inline: true },
        { name: 'Or:', value: '`!usage !usage`', inline: true }
      ]
    };
  },

  type: 'text'
};
