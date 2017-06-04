'use strict';

module.exports = {
  run: function (msg, params, client) {
    const mentions = msg.mentions;
    const avatar = (mentions.length ? mentions.shift() : msg.author).getAvatarURL({ size: 1024 });
    return msg.channel.sendMessage('', false, {
      "description": `See [full image](${avatar})`,
      "color": 6914713,
      "image": {
        "url": avatar
      }
    });
  }
};