'use strict';

module.exports = {
  run: function (msg) {
    return msg.channel.sendMessage('https://skiptirengu.ga/karen.png');
  },

  usage: function () {
    return {
      description: '¯\\\_(ツ)\_/¯',
    };
  },

  type: 'easter-egg'
};
