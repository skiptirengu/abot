'use strict';

const path = require('path');
const queue = require('./queue');

function getFile(file) {
  return path.join(process.cwd(), 'res', 'audio', file);
}

function getVolume(arg) {
  const volume = parseFloat(arg);
  if (!arg || isNaN(volume)) return null;
  return volume > 100 ? 100 : volume;
}

function newCommand(file) {
  return {
    run: function (msg, params) {
      let outputArgs = [];
      const volume = getVolume(params.shift());
      if (volume !== null) outputArgs = ['-af', `volume=${volume}`];
      return queue.playFile(msg, getFile(file), outputArgs);
    },

    usage: function () {
      return {
        title: '[<volume>]',
        description: `Play the file ${file} with the volume set to value of "**volume**". If no volume is provided it uses the file's volume.`
      };
    },

    type: 'voice'
  };
}

module.exports = {
  jeff: newCommand('jeff.mp3'),
  yeexp: newCommand('yeexp.m4a'),
  yee: newCommand('yee.mp3'),
  seinfeld: newCommand('seinfeld.mp3'),
};
