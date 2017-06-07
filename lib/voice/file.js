'use strict';

const path = require('path');
const queue = require('./queue');

function getFile(file) {
  return path.join(process.cwd(), 'res', 'audio', file);
}

function newCommand(file) {
  return {
    run: function (msg) {
      return queue.playFile(msg, getFile(file));
    },
    type: 'voice'
  };
}

module.exports = {
  jeff: newCommand('jeff.mp3'),
  yee: newCommand('yee.mp3')
};