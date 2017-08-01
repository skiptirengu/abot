'use strict';

const { wrapCode } = require('./../util');
const { spawnSync } = require('child_process');
const log = require('./../log');

module.exports = {
  run: function (msg) {
    msg.channel.sendMessage(wrapCode('Reloading...')).catch(log.error);
    spawnSync('npm run reboot', [], { cwd: process.cwd() });
    return Promise.resolve();
  },

  usage: function () {
    return {
      description: 'Restarts the bot (you probably shoudn\'t use this command if you don\'t know exactly what you\'re doing).',
    };
  },

  type: 'text'
};
