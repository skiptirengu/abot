'use strict';

const { randomColor } = require('./../util');

function filter(type) {
  const cmds = require('./../commands');
  return Object.keys(cmds).filter((item) => cmds[item].type === type);
}

module.exports = {
  run: function (msg) {
    return msg.channel.sendMessage(
      'Use `!usage <command-name>` for information about an especific command', false, {
        color: randomColor(),
        fields: [
          { name: 'Voice commands:', value: filter('voice').join('  ') },
          { name: 'Text commands:', value: filter('text').join('  ') }
        ]
      });
  },

  usage: function () {
    return {
      description: 'List all commands this bot has.',
    };
  },

  type: 'text'
};
