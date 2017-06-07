'use strict';

module.exports = {
  // text commands
  '!roulette': require('./text/roulette'),
  '!reload': require('./text/reload'),
  '!avatar': require('./text/avatar'),
  '!about': require('./text/about'),
  '!help': require('./text/help'),

  // music player commands
  '!queue': require('./voice/queue'),
  '!search': require('./voice/search'),
  '!select': require('./voice/select'),
  '!next': require('./voice/next'),
  '!stop': require('./voice/stop'),
  '!jeff': require('./voice/file').jeff,
  '!yee': require('./voice/file').yee,
};
