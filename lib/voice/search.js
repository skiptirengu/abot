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

  /**
   * Accept both user + guild or the actual user hash
   * @example
   * search.deleteUserQuery(guild, object)
   * @example
   * search.deleteUserQuery(userHash)
   * @returns void
   */
  deleteUserQuery: function (guild, user) {
    const hash = (typeof guild === 'string' && !user) ? guild : getHash(guild, user);
    delete resultSets[hash];
  },

  /**
   * Generates an unique MD5 hash for the user, combining 
   * both the user and guild id.
   * @param {IGuild} guild
   * @param {IUser}  user
   * @returns {string}
   */
  getHash: getHash, //TODO move this to util later (if needed)

  type: 'voice'
};
