const youtubeSearch = require('youtube-search');
const util = require('./../util');

let queryResults = [];

function doQuery(term) {
  return new Promise((resolve, reject) => {
    const opts = {
      maxResults: 5,
      key: arrombot.youtube_token,
      safeSearch: 'none',
      videoSyndicated: true,
      type: 'video'
    };
    youtubeSearch(term, opts, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function formatQuery(results) {
  if (results.length === 0) return 'Couldn\'t find what you\'re looking for :/.';
  return results.map((element, idx) => {
    return `${idx + 1}. ${element.title}`;
  }).join('\n');
}

module.exports = {
  run: function (msg, params) {
    const query = params.join(' ');
    return doQuery(query)
      .then(results => {
        return formatQuery(queryResults = results);
      })
      .then(str => {
        return msg.channel.sendMessage(util.wrapMd(str));
      });
  },
  getQueryResults: function () {
    return queryResults;
  }
};
