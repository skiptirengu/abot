'use strict';

const { randomColor } = require('./../util');

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
      color: randomColor(),
      image: {
        url: user.getAvatarURL({ size: 1024, preferAnimated: true })
      }
    });
  },

  usage: function () {
    return {
      title: '<mention>',
      description: 'Show someone\'s avatar. If "**mention**" is not defined, shows the user\'s profile picture.',
      fields: [
        { name: 'Example:', value: '`!avatar @Someone#2469`', inline: true }
      ]
    };
  },

  type: 'text'
};
