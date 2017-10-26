'use strict';

const { randomColor } = require('../util');
const path = require('path');
const pkgJson = require(path.join(process.cwd(), 'package.json'));

module.exports = {
  run: function (msg) {
    return msg.channel.sendMessage('', false, {
      title: pkgJson.description,
      description: '',
      url: pkgJson.repository.url,
      color: randomColor(),
      thumbnail: { url: 'https://skiptirengu.com/arrombot.jpg' },
      author: {
        name: 'Skiptir Engu (Skiptir Engu#6682)',
        url: 'https://skiptirengu.com',
        icon_url: 'https://skiptirengu.com/profile.png'
      },
      fields: [
        { name: 'Author', value: pkgJson.author },
        { name: 'License', value: pkgJson.license },
      ]
    });
  },

  usage: function () {
    return {
      description: 'Show some useless information about this bot.',
    };
  },

  type: 'text'
};
