'use strict';

const search = require('./search');
const util = require('./../util');
const queue = require('./queue');

module.exports = {
  run: function (msg, params) {
    const num = parseInt(params.join(''));
    const results = search.getQueryResults();
    if (results.length === 0) {
      return msg.channel.sendMessage(util.wrapCode('There isn\'t anything to select. Use "!search" first.'));
    }
    if (isNaN(num) || !results[num - 1]) {
      return msg.channel.sendMessage(util.wrapCode(`You must select a number between "1" and "${results.length + 1}".`));
    }
    return queue.append(results[num - 1].link, msg);
  }
};
