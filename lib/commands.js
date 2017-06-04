'use strict';

module.exports = {
  // text commands
  '!roulette': require('./text/roulette'),
  '!reload': require('./text/reload'),
  '!avatar': require('./text/avatar'),

  // music player commands
  '!search': require('./voice/search'),
  '!queue': require('./voice/queue'),
  '!next': require('./voice/next'),
  '!select': require('./voice/select'),
  '!stop': require('./voice/stop')
};
