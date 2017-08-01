'use strict';

function wrap(str, lang) {
  lang = lang || '';
  return '```' + lang + '\n' + str + '\n```';
}

module.exports = {
  wrapCode: function (str) {
    return wrap(str);
  },

  wrapMd: function (str) {
    return wrap(str, 'Markdown');
  },

  randomColor: function () {
    return Math.floor(Math.random() * 0xffffff);
  },

  guildTag: function (gid) {
    const guild = typeof gid === 'string'
      ? global.arrombot.client.Guilds.get(gid)
      : gid;
    return `${guild.id} - ${guild.name}`;
  }
};
