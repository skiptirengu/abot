'use strict';

const util = require('./../util');

function filter(type) {
  const cmds = require('./../commands');
  return Object.keys(cmds).filter((item) => cmds[item].type === type);
}

module.exports = {
  run: function (msg) {
    return msg.channel.sendMessage('', false, {
      color: util.randomColor(),
      fields: [
        { name: 'Voice commands:', value: filter('voice').join('  ') },
        { name: 'Text commands:', value: filter('text').join('  ') }
      ]
    });
  },
  type: 'text'
};
