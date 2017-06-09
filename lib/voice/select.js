'use strict';

const search = require('./search');
const wrapCode = require('./../util').wrapCode;
const queue = require('./queue');

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
    // We store the queryHash instead of using "msg.guild" and "msg.author" 
    // to prevent cache invalidation issues after the delete timeout
    const queryHash = search.getHash(msg.guild, msg.author);
    return queue.playUrl(msg, results[num - 1].link).then(() => {
      // Delete user's query after 1 minute
      setTimeout(() => search.deleteUserQuery(queryHash), 60000);
    });
  },

  type: 'voice'
};
