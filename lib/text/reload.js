'use strict';

const { wrapCode } = require('./../util');
const { spawnSync } = require('child_process');
const log = require('./../log');

module.exports = {
  run: function (msg) {
    msg.channel.sendMessage(wrapCode('Reloading...')).catch(log.error);
    spawnSync('npm restart', [], { cwd: process.cwd() });
    return Promise.resolve();
  },

  type: 'text'
};
