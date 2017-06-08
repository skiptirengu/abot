'use strict';

const util = require('./../util');

module.exports = {
  run: function (msg) {
    const mentions = msg.mentions;
    const user = mentions.length ? mentions.shift() : msg.author;
    const sizes = [256, 1024, 2048].map(size => {
      const avatar = user.getAvatarURL({ size });
      return `+ Size [${size} x ${size}](${avatar})`;
    });
    return msg.channel.sendMessage('', false, {
      description: sizes.join('\n'),
      color: util.randomColor(),
      image: {
        url: user.getAvatarURL({ size: 1024 })
      }
    });
  },
  type: 'text'
};
