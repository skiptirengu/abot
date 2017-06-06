'use strict';

const util = require('./../util');

module.exports = {
  run: function (msg) {
    const mentions = msg.mentions;
    const avatar = (mentions.length ? mentions.shift() : msg.author).getAvatarURL({ size: 1024 });
    return msg.channel.sendMessage('', false, {
      'description': `See [full image](${avatar})`,
      'color': util.randomColor(),
      'image': {
        'url': avatar
      }
    });
  },
  type: 'text'
};