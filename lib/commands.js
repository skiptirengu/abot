'use strict';

const file = require('./voice/file');

module.exports = {
  // text commands
  '!roulette': require('./text/roulette'),
  '!reload': require('./text/reload'),
  '!avatar': require('./text/avatar'),
  '!about': require('./text/about'),
  '!help': require('./text/help'),
  '!usage': require('./text/usage'),

  // music player commands
  '!queue': require('./voice/queue'),
  '!search': require('./voice/search'),
  '!select': require('./voice/select'),
  '!next': require('./voice/next'),
  '!stop': require('./voice/stop'),
  // file commands
  '!seinfeld': file.seinfeld,
  '!jeff': file.jeff,
  '!yee': file.yee,
  '!yeexp': file.yeexp
};
