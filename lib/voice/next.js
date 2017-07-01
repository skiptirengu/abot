'use strict';

const queue = require('./queue');

module.exports = {
  run: function (msg) {
    return Promise.resolve().then(() => queue.next(msg.guild.id));
  },

  usage: function () {
    return {
      description: 'Skip the current playing audio.'
    };
  },

  type: 'voice'
};
