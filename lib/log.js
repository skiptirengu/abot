'use strict';

const winston = require('winston');
winston.add(winston.transports.File, { filename: './../runtime/arrombot.log' });
winston.remove(winston.transports.Console);
module.exports = winston;
