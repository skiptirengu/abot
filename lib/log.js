'use strict';

const winston = require('winston');
const path = require('path');

const parentLog = winston.log;

function tagLog(tag, msg) {
  return `[${tag}] ${msg}`;
}

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

winston.log = function () {
  const args = Array.prototype.slice.call(arguments);
  if (typeof args[1] === 'object' && (args[1].message && args[1].tag)) {
    const opts = args[1];
    return parentLog.apply(
      this, [args[0], tagLog(opts.tag, opts.message)].concat(args.slice(2))
    );
  }
  return parentLog.apply(this, args);
};

module.exports = winston;
