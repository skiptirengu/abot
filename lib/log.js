'use strict';

const { createLogger, transports, format } = require('winston');
const { combine, timestamp, printf } = format;
const path = require('path');

const logger = createLogger({
  format: combine(
    timestamp(),
    printf((nfo) => {
      const tag = nfo.tag ? `[${nfo.tag}]` : '';
      return `${nfo.timestamp} - ${nfo.level}: ${tag} ${nfo.message}`;
    })
  ),
  transports: [
    new transports.File({
      filename: path.join(process.cwd(), 'runtime', 'arrombot.log'),
      level: 'verbose',
      maxsize: 1048576,
      maxFiles: 20
    })
  ]
});

module.exports = logger;
