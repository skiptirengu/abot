'use strict';

const youtubeSearch = require('youtube-search');
const util = require('./../util');
const crypto = require('crypto');

let resultSets = {};

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
  return results.map((element, idx) => `${idx + 1}. ${element.title}`).join('\n');
}

function store(msg, results) {
  const hash = getHash(msg.guild, msg.author);
  return resultSets[hash] = results;
}

function getHash(guild, user) {
  return crypto.createHash('md5').update(`${guild.id}.${user.id}`).digest('hex');
}

module.exports = {
  run: function (msg, params) {
    if (!arrombot.youtube_token) {
      return msg.channel.sendMessage(util.wrapCode('You need to configure your YouTube token to use this command.'));
    }
    return doQuery(params.join(' '))
      .then(results => formatQuery(store(msg, results)))
      .then(str => msg.channel.sendMessage(util.wrapMd(str)));
  },
  getUserQuery: function (guild, user) {
    return resultSets[getHash(guild, user)] || null;
  },
  deleteUserQuery: function (guild, user) {
    delete resultSets[getHash(guild, user)];
  },
  type: 'voice'
};
