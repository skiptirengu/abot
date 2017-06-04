'use strict';

const winston = require('winston');
const path = require('path');

winston.add(winston.transports.File, { filename: path.join(process.cwd(), 'runtime', 'arrombot.log') });
winston.remove(winston.transports.Console);
module.exports = winston;
