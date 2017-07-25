'use strict';

const winston = require('winston');
const path = require('path');

winston.add(winston.transports.File, {
  filename: path.join(process.cwd(), 'runtime', 'arrombot.log'),
  level: 'verbose',
  colorize: false,
  timestamp: true,
  maxSize: 1048576,
  maxFiles: 20,
  json: false,
  prettyPrint: false,
  humanReadableUnhandledException: true,
  depth: 2,
  tailable: true,
  source: true
});
winston.remove(winston.transports.Console);
module.exports = winston;
