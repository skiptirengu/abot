'use strict';

const queue = require('./queue');

module.exports = {
  run: function () {
    return Promise.resolve().then(() => queue.stop());
  },

  usage: function () {
    return {
      description: 'Stop the current playing music and clears the music queue.'
    };
  },

  type: 'voice'
};
