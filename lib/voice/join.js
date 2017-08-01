'use strict';

const queue = require('./queue');

module.exports = {
  run: function (msg) {
    return queue.joinChannel(msg.member.getVoiceChannel());
  },

  usage: function () {
    return {
      description: 'Joins the voice channel the user is ***currently*** connected to.',
      fields: [
        { name: 'Example:', value: '`!join`', inline: true },
      ]
    };
  },

  type: 'voice'
};
