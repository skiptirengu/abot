'use strict';

module.exports = {
  // text commands
  '!roulette': require('./text/roulette'),
  '!reload': require('./text/reload'),
  '!avatar': require('./text/avatar'),
  '!help': require('./text/help'),

  // music player commands
  '!search': require('./voice/search'),
  '!queue': require('./voice/queue'),
  '!next': require('./voice/next'),
  '!select': require('./voice/select'),
  '!stop': require('./voice/stop')
};
