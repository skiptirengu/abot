'use strict';

const queue = require('./queue');

module.exports = {
  run: function () {
    return Promise.resolve().then(() => queue.next());
  },

  usage: function () {
    return {
      description: 'Skip the current playing audio.'
    };
  },

  type: 'voice'
};
