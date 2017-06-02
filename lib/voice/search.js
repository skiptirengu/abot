const youtubeSearch = require('youtube-search');

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
      resolve(results)
    });
  });
}

module.exports = {
  run: function(msg, params) {
    const query = params.join(' ');
    return doQuery(query).then(results => {
      queryResults = results;
      return msg.channel.sendMessage('Len ' + queryResults.length);
    });
  },
  getQueryResults: function () {
    return queryResults;
  }
};
