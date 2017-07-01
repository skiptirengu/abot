'use strict';

const queue = require('./queue');

module.exports = {
  run: function (msg) {
    return Promise.resolve().then(() => queue.stop(msg.guild.id));
  },

  usage: function () {
    return {
      description: 'Stop the current playing music and clears the music queue.'
    };
  },

  type: 'voice'
};
