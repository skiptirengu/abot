'use strict';

const util = require('./../util');

function filter(type) {
  const cmds = require('./../commands');
  return Object.keys(cmds).filter((item) => cmds[item].type === type);
}

module.exports = {
  run: function (msg) {
    const textCmds = filter('text');
    const voiceCmds = filter('voice');
    return msg.channel.sendMessage('', false, {
      'color': util.randomColor(),
      'fields': [
        { name: 'Voice commands', value: voiceCmds.join('\n') },
        { name: 'Text commands', value: textCmds.join('\n') }
      ]
    });
  },
  type: 'text'
};