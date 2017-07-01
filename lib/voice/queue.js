'use strict';

const youtubedl = require('youtube-dl');
const { wrapCode } = require('./../util');
const log = require('./../log');
const ASyncquence = require('a-syncquence');

const ytdlOptions = [
  '-f', 'bestaudio/best',
  '--skip-download'
];

let voiceMap = {};
let queueMap = {};
let encdrMap = {};

function getVoiceConnection(guild) {
  return voiceMap[guild] || null;
}

function getEncoder(guild) {
  return encdrMap[guild] || null;
}

function getQueue(guild) {
  return queueMap[guild] || (queueMap[guild] = new ASyncquence());
}

function getVoiceChannel(guild) {
  return new Promise((resolve, reject) => {
    const channels = guild.voiceChannels;
    if (channels.length === 0) return reject('No voice channels.');
    const chan = channels.reduce((acc, cur) => cur.members.length > acc.members.length ? cur : acc);
    resolve(chan);
  });
}

function pushQueue(guildId, playCallback) {
  const musicQueue = getQueue(guildId);
  musicQueue.push(function (callback) {
    getVoiceChannel(arrombot.client.Guilds.get(guildId))
      .then(vc => vc.join())
      .then(vcInfo => playCallback(vcInfo, callback))
      .catch(err => {
        log.error(err);
        callback();
      });
  });
  musicQueue.onNext(() => next(guildId));
  // setting a small timeout prevents the bot from
  // quitting too soon when playing short duration audios (∩ ͡° ͜ʖ ͡°)⊃━☆ﾟ*
  musicQueue.onEnd(() => setTimeout(cleanupVoice, 324, guildId));
  process.nextTick(() => musicQueue.start());
}

function play(guildId, input, inputArgs = [], outputArgs = []) {
  pushQueue(guildId, (vcInfo, callback) => {
    voiceMap[guildId] = vcInfo;
    const encoder = vcInfo.voiceConnection.createExternalEncoder({
      type: 'ffmpeg',
      format: 'pcm',
      source: input,
      debug: true,
      inputArgs: inputArgs,
      outputArgs: outputArgs
    });
    encdrMap[guildId] = encoder;
    encoder.play();
    encoder.once('end', callback);
  });
}

function cleanupVoice(guildId) {
  const voice = getVoiceConnection(guildId);
  if (voice !== null) {
    voice.voiceConnection.disconnect();
    process.nextTick(() => {
      delete encdrMap[guildId];
      delete voiceMap[guildId];
    });
  }
}

function parseUrl(video) {
  return new Promise((resolve, reject) => {
    youtubedl.getInfo(video, ytdlOptions, { maxBuffer: 7000 * 1024 }, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
}

function queueUrl(msg, url) {
  return parseUrl(url).then(info => {
    play(msg.guild.id, info.url, [
      '-reconnect', 1,
      '-reconnect_streamed', 1,
      '-reconnect_delay_max', 5
    ]);
    return msg.channel.sendMessage(wrapCode(`${info.title} queued.`));
  });
}

function next(guild) {
  const encoder = getEncoder(guild);
  if (encoder) encoder.destroy();
}

module.exports = {
  run: function (msg, params) {
    return queueUrl(msg, params.join('')).then(() => msg.delete());
  },

  usage: function () {
    return {
      title: '<url>',
      description: 'Adds a music to the play queue, being "**url**" an youtube video id or any valid link. Check [this](https://rg3.github.io/youtube-dl/supportedsites.html) for a complete list of the 1000+ supported sites.',
      fields: [
        { name: 'Example:', value: '`!queue http://my.video.com/xD.mp4`', inline: true },
        { name: 'Or:', value: '`!queue dQw4w9WgXcQ`', inline: true }
      ]
    };
  },

  playUrl: function (msg, url) {
    //TODO This MAY BE an issue. We're queuing the parsed url, which means
    //that we MIGHT hit an expired youtube url if the queue is too long
    return queueUrl(msg, url);
  },

  playFile: function (msg, file, outputArgs) {
    return Promise.resolve().then(() => play(msg.guild.id, file, [], outputArgs));
  },

  stop: function (guildId) {
    getQueue(guildId).stop();
  },

  next: function (guildId) {
    next(guildId);
  },

  type: 'voice'
};
