'use strict';

const queue = require('./queue');

module.exports = {
  run: function () {
    return Promise.resolve().then(() => queue.next());
  },

  type: 'voice'
};
