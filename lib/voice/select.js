'use strict';

const search = require('./search');
const { wrapCode } = require('./../util');
const queue = require('./queue');

// User's hash -> timeout
const timeouts = {};

module.exports = {
  run: function (msg, params) {
    const num = parseInt(params.join(''));
    const results = search.getUserQuery(msg.guild, msg.author);
    if (!results || results.length === 0) {
      return msg.channel.sendMessage(wrapCode('There isn\'t anything to select. Use "!search" first.'));
    }
    if (isNaN(num) || !results[num - 1]) {
      return msg.channel.sendMessage(wrapCode(`You must select a number between "1" and "${results.length}".`));
    }
    const queryHash = search.getHash(msg.guild, msg.author);
    if (timeouts[queryHash]) {
      clearTimeout(timeouts[queryHash]);
      delete timeouts[queryHash];
    }
    return queue.playUrl(msg, results[num - 1].link).then(() => {
      // Delete user's query after 1 minute
      timeouts[queryHash] = setTimeout(() => search.deleteUserQuery(queryHash), 60000);
    });
  },

  type: 'voice'
};
