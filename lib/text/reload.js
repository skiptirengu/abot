'use strict';

const util = require('./../util');
const log = require('./../log');
const spawn = require('child_process').spawnSync;

module.exports = {
  run: function (msg) {
    msg.channel.sendMessage(util.wrapCode('Reloading...')).catch(log.error);
    spawn('npm restart', [], { cwd: process.cwd() });
    return Promise.resolve();
  },
  type: 'text'
};
